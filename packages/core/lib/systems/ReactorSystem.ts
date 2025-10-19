import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { GameOverReason, SystemType } from "@skeldjs/constant";
import { BaseDataMessage, CompletedConsoleDataMessage, ReactorSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import {
    ReactorConsoleAddEvent,
    ReactorConsoleRemoveEvent,
    ReactorConsolesResetEvent,
    SystemSabotageEvent
} from "../events";

import { SystemStatusEvents } from "./events";
import { StatefulRoom } from "../StatefulRoom";
import { AmongUsEndGames, EndGameIntent } from "../endgame";
import { DataState } from "../NetworkedObject";

export type ReactorSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[
        ReactorConsoleAddEvent<RoomType>,
        ReactorConsoleRemoveEvent<RoomType>,
        ReactorConsolesResetEvent<RoomType>
    ]>;

/**
 * Represents a system responsible for handling reactor consoles.
 *
 * See {@link ReactorSystemEvents} for events to listen to.
 */

export class ReactorSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, ReactorSystemEvents<RoomType>> {
    private _lastUpdate = 0;

    /**
     * The timer before the reactor explodes.
     */
    timer: number = 10000;

    /**
     * The completed consoles.
     */
    completed: Set<number> = new Set;
    
    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        public readonly maxTimer: number,
    ) {
        super(ship, systemType);
    }

    get sabotaged() {
        return this.timer < 10000;
    }

    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return ReactorSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof ReactorSystemDataMessage) {
            this.timer = data.timer;
            this.completed.clear();
            for (const completedConsole of data.completedConsoles) {
                this.completed.add(completedConsole.consoleId);
            }
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            return new ReactorSystemDataMessage(this.timer, [...this.completed].map(consoleId => new CompletedConsoleDataMessage(consoleId)));
        }
        return undefined;
    }

    private async _addConsole(player: Player<RoomType> | undefined, consoleId: number, rpc: RepairSystemMessage | undefined) {
        this.completed.add(consoleId);
        this.pushDataUpdate();

        const ev = await this.emit(
            new ReactorConsoleAddEvent(
                this.room,
                this,
                undefined,
                player,
                consoleId
            )
        );

        if (ev.reverted) {
            this.completed.delete(ev.consoleId);
            return;
        }

        if (ev.alteredConsoleId !== consoleId) {
            this.completed.delete(consoleId);
            this.completed.add(ev.alteredConsoleId);
        }

        if (this.completed.size >= 2) {
            await this._repair(player, rpc);
        }
    }

    /**
     * Add a completed console. (Same as a player placing their hand on a
     * console)
     * @param consoleId The ID of the console to add.
     */
    async addConsolePlayer(consoleId: number, addedPlayer: Player<RoomType>) {
        await this._addConsole(addedPlayer, consoleId, undefined);
    }

    async addConsole(consoleId: number) {
        await this._sendRepair(0x40 | consoleId);
    }

    private async _removeConsole(player: Player<RoomType> | undefined, consoleId: number, rpc: RepairSystemMessage | undefined) {
        this.completed.delete(consoleId);
        this.pushDataUpdate();

        const ev = await this.emit(
            new ReactorConsoleRemoveEvent(
                this.room,
                this,
                undefined,
                player,
                consoleId
            )
        );

        if (ev.reverted) {
            return this.completed.add(ev.consoleId);
        }

        if (ev.alteredConsoleId !== consoleId) {
            this.completed.add(consoleId);
            this.completed.delete(ev.alteredConsoleId);
        }
    }

    /**
     * Remove a completed console. (Same as a player removing their hand from a
     * console)
     * @param consoleId The ID of the console to add.
     */
    async removeConsolePlayer(consoleId: number, removedPlayer: Player<RoomType>) {
        await this._removeConsole(removedPlayer, consoleId, undefined);
    }

    async removeConsole(consoleId: number) {
        await this._sendRepair(0x20 | consoleId);
    }

    async handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        this.timer = this.maxTimer;
        this.pushDataUpdate();
        this.completed = new Set;

        await this.emit(
            new SystemSabotageEvent(
                this.room,
                this,
                rpc,
                player
            )
        );
    }

    private async _repair(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        const oldTimer = this.timer;
        const oldCompleted = this.completed;
        this.timer = 10000;
        this.completed = new Set;
        this.pushDataUpdate();

        const ev = await this.emit(
            new ReactorConsolesResetEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.timer = oldTimer;
            this.completed = oldCompleted;
        }
    }

    async fullyRepairHost(): Promise<void> {
        await this._repair(undefined, undefined);
    }

    async fullyRepairPlayer(repairedByPlayer: Player<RoomType>) {
        await this._repair(repairedByPlayer, undefined);
    }

    async sendFullRepair() {
        await this._sendRepair(0x10);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined) {
        const consoleId = amount & 0x3;

        if (amount & 0x40) {
            await this._addConsole(player, consoleId, rpc);
        } else if (amount & 0x20) {
            await this._removeConsole(player, consoleId, rpc);
        } else if (amount & 0x10) {
            await this._repair(player, rpc);
        }

        this.pushDataUpdate();
    }

    async processFixedUpdate(delta: number) {
        if (!this.sabotaged)
            return;

        this.timer -= delta;
        this._lastUpdate += delta;

        if (this._lastUpdate > 2) {
            this._lastUpdate = 0;
        this.pushDataUpdate();
        }

        if (this.timer <= 0) {
            this.room.registerEndGameIntent(
                new EndGameIntent(
                    AmongUsEndGames.ReactorSabotage,
                    GameOverReason.ImpostorBySabotage,
                    {}
                )
            );
        }
    }
}
