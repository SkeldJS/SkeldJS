import { HazelReader, HazelWriter } from "@skeldjs/util";
import { GameOverReason, SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
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

export interface LifeSuppSystemData {
    timer: number;
    completed: Set<number>;
}

export type LifeSuppSystemEvents<RoomType extends StatefulRoom = StatefulRoom> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[
        O2ConsolesClearEvent<RoomType>,
        O2ConsolesCompleteEvent<RoomType>
    ]>;

/**
 * Represents a system responsible for handling oxygen consoles.
 *
 * See {@link LifeSuppSystemEvents} for events to listen to.
 */
export class LifeSuppSystem<RoomType extends StatefulRoom = StatefulRoom> extends SystemStatus<
    LifeSuppSystemData,
    LifeSuppSystemEvents,
    RoomType
> implements LifeSuppSystemData {
    private lastUpdate = 0;

    /**
     * The timer until oxygen runs out.
     */
    timer: number;

    /**
     * The completed consoles.
     */
    completed: Set<number>;

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | LifeSuppSystemData
    ) {
        super(ship, systemType, data);

        this.timer ??= 10000;
        this.completed ||= new Set;
    }

    get sabotaged() {
        return this.timer < 10000;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    deserializeFromReader(reader: HazelReader, spawn: boolean) {
        const timer = this.timer;
        this.timer = reader.float();

        const num_consoles = reader.upacked();
        if (this.completed.size > 0 && num_consoles === 0) {
            this._clearConsoles(undefined, undefined);
        } else {
            for (let i = 0; i < num_consoles; i++) {
                const consoleId = reader.upacked();
                this._completeConsole(consoleId, undefined, undefined);
            }
        }

        if (timer === 10000 && this.timer < 10000) {
            this.emitSync(
                new SystemSabotageEvent(
                    this.room,
                    this,
                    undefined,
                    undefined
                )
            );
        } else if (timer < 10000 && this.timer === 10000) {
            this.emitSync(
                new SystemRepairEvent(
                    this.room,
                    this,
                    undefined,
                    undefined
                )
            );
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    serializeToWriter(writer: HazelWriter, spawn: boolean) {
        writer.float(this.timer);

        writer.upacked(this.completed.size);
        for (const console of this.completed) {
            writer.upacked(console);
        }
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

    private async _clearConsoles(player: Player | undefined, rpc: RepairSystemMessage | undefined) {
        const completedBefore = new Set(this.completed);
        this.completed = new Set;
        this.dirty = true;

        const ev = await this.emit(
            new O2ConsolesClearEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.completed = completedBefore;
        }
    }

    /**
     * Clear the completed consoles. This is a host operation on official servers.
     */
    async clearConsolesPlayer(clearedByPlayer: Player | undefined) {
        await this._clearConsoles(clearedByPlayer, undefined);
    }

    private async _completeConsole(consoleId: number, player: Player | undefined, rpc: RepairSystemMessage | undefined): Promise<void> {
        this.completed.add(consoleId);
        this.dirty = true;

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
     * Mark a console as being complete.
     * @param consoleId The ID of the console to mark as complete.
     */
    async completeConsolePlayer(consoleId: number, completedByPlayer: Player) {
        await this._completeConsole(consoleId, completedByPlayer, undefined);
    }

    async completeConsole(consoleId: number) {
        await this._sendRepair(0x40 | consoleId);
    }

    private async _repair(player: Player | undefined, rpc: RepairSystemMessage | undefined) {
        const oldTimer = this.timer;
        const oldCompleted = this.completed;
        this.timer = 10000;
        this.completed = new Set;
        this.dirty = true;

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
            this.completed = oldCompleted;
        }
    }

    async fullyRepairHost(): Promise<void> {
        await this._repair(undefined, undefined);
    }

    async fullyRepairPlayer(player: Player) {
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
            this.dirty = true;
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
