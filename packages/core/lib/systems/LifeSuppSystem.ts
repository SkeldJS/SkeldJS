import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { GameOverReason, SystemType } from "@skeldjs/constant";
import { BaseDataMessage, CompletedConsoleDataMessage, LifeSuppSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import {
    O2ConsolesClearEvent,
    O2ConsolesCompleteEvent,
    SystemRepairEvent,
    SystemSabotageEvent
} from "../events";

import { SystemStatusEvents } from "./events";
import { StatefulRoom } from "../StatefulRoom";
import { AmongUsEndGames, EndGameIntent } from "../endgame";
import { DataState } from "../NetworkedObject";

export type LifeSuppSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[
        O2ConsolesClearEvent<RoomType>,
        O2ConsolesCompleteEvent<RoomType>
    ]>;

/**
 * Represents a system responsible for handling oxygen consoles.
 *
 * See {@link LifeSuppSystemEvents} for events to listen to.
 */
export class LifeSuppSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, LifeSuppSystemEvents<RoomType>> {
    private lastUpdate = 0;

    /**
     * The timer until oxygen runs out.
     */
    timer: number = 10000;

    /**
     * The completed consoles.
     */
    completedConsoles: Set<number> = new Set;

    get sabotaged() {
        return this.timer < 10000;
    }
    
    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return LifeSuppSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof LifeSuppSystemDataMessage) {
            const previousTimer = this.timer;
            this.timer = data.timer;

            if (this.completedConsoles.size > 0 && data.completedConsoles.length === 0) {
                await this._clearConsoles(undefined, undefined);
            } else {
                for (const completedConsole of data.completedConsoles) {
                    if (this.completedConsoles.has(completedConsole.consoleId)) continue;
                    await this._completeConsole(completedConsole.consoleId, undefined, undefined);
                }
            }

            if (previousTimer === 10000 && this.timer < 10000) {
                await this.emit(
                    new SystemSabotageEvent(
                        this.room,
                        this,
                        undefined,
                        undefined
                    )
                );
            } else if (previousTimer < 10000 && this.timer === 10000) {
                await this.emit(
                    new SystemRepairEvent(
                        this.room,
                        this,
                        undefined,
                        undefined
                    )
                );
            }
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return new LifeSuppSystemDataMessage(this.timer,
            [...this.completedConsoles].map(consoleId => new CompletedConsoleDataMessage(consoleId)));
        }
        return undefined;
    }

    async handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        this.timer = 45;
        this._clearConsoles(player, rpc);

        await this.emit(
            new SystemSabotageEvent(
                this.room,
                this,
                rpc,
                player
            )
        );
    }

    private async _clearConsoles(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        const completedBefore = new Set(this.completedConsoles);
        this.completedConsoles = new Set;
        this.pushDataUpdate();

        const ev = await this.emit(
            new O2ConsolesClearEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.completedConsoles = completedBefore;
        }
    }

    /**
     * Clear the completed consoles. This is a host operation on official servers.
     */
    async clearConsolesPlayer(clearedByPlayer: Player<RoomType> | undefined) {
        await this._clearConsoles(clearedByPlayer, undefined);
    }

    private async _completeConsole(consoleId: number, player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined): Promise<void> {
        this.completedConsoles.add(consoleId);
        this.pushDataUpdate();

        const ev = await this.emit(
            new O2ConsolesCompleteEvent(
                this.room,
                this,
                undefined,
                player,
                consoleId
            )
        );

        if (ev.reverted) {
            this.completedConsoles.delete(ev.consoleId);
            return;
        }

        if (ev.alteredConsoleId !== consoleId) {
            this.completedConsoles.delete(consoleId);
            this.completedConsoles.add(ev.alteredConsoleId);
        }

        if (this.completedConsoles.size >= 2) {
            await this._repair(player, rpc);
        }
    }

    /**
     * Mark a console as being complete.
     * @param consoleId The ID of the console to mark as complete.
     */
    async completeConsolePlayer(consoleId: number, completedByPlayer: Player<RoomType>) {
        await this._completeConsole(consoleId, completedByPlayer, undefined);
    }

    async completeConsole(consoleId: number) {
        await this._sendRepair(0x40 | consoleId);
    }

    private async _repair(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        const oldTimer = this.timer;
        const oldCompleted = this.completedConsoles;
        this.timer = 10000;
        this.completedConsoles = new Set;
        this.pushDataUpdate();

        const ev = await this.emit(
            new O2ConsolesClearEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.timer = oldTimer;
            this.completedConsoles = oldCompleted;
        }
    }

    async fullyRepairHost(): Promise<void> {
        await this._repair(undefined, undefined);
    }

    async fullyRepairPlayer(player: Player<RoomType>) {
        this._repair(player, undefined);
    }

    async sendFullRepair() {
        await this._sendRepair(0x10);
    }

    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined) {
        const consoleId = amount & 0x3;

        if (amount & 0x40) {
            await this._completeConsole(consoleId, player, rpc);
        } else if (amount & 0x10) {
            await this._repair(player, rpc);
        }
    }

    async processFixedUpdate(delta: number) {
        if (!this.sabotaged) return;

        this.timer -= delta;
        this.lastUpdate += delta;

        if (this.lastUpdate > 2) {
            this.lastUpdate = 0;
            this.pushDataUpdate();
        }

        if (this.timer <= 0) {
            this.room.registerEndGameIntent(
                new EndGameIntent(
                    AmongUsEndGames.O2Sabotage,
                    GameOverReason.ImpostorBySabotage,
                    {}
                )
            );
        }
    }
}
