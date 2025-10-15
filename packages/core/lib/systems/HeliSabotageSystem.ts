import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import {
    HeliSabotageConsoleOpenEvent,
    HeliSabotageConsolesResetEvent,
    HeliSabotageConsoleCloseEvent,
    HeliSabotageConsoleCompleteEvent,
    SystemRepairEvent,
    SystemSabotageEvent
} from "../events";

import { SystemStatusEvents } from "./events";
import { StatefulRoom } from "../StatefulRoom";

export type HeliSabotageSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[
        HeliSabotageConsoleOpenEvent<RoomType>,
        HeliSabotageConsolesResetEvent<RoomType>,
        HeliSabotageConsoleCloseEvent<RoomType>,
        HeliSabotageConsoleCompleteEvent<RoomType>
    ]>;

export const HeliSabotageSystemRepairTag = {
    FixBit: 0x10,
    DeactiveBit: 0x20,
    ActiveBit: 0x40,
    DamageBit: 0x80
} as const;

/**
 * Represents a system responsible for handling communication sabotages on The Skeld and Polus.
 *
 * See {@link HeliSabotageSystemEvents} for events to listen to.
 */
export class HeliSabotageSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, HeliSabotageSystemEvents<RoomType>> {
    private _syncTimer: number = 1;

    countdown: number = 10000;
    resetTimer: number = -1;
    activeConsoles: Map<number, number> = new Map;
    completedConsoles: Set<number> = new Set;

    /**
     * Whether or not communications is sabotaged.
     */
    get sabotaged() {
        return this.completedConsoles.size < 2;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    deserializeFromReader(reader: HazelReader, spawn: boolean) {
        this.countdown = reader.float();
        this.resetTimer = reader.float();
        const numActive = reader.packed();
        const beforeActive = this.activeConsoles;
        this.activeConsoles = new Map;
        for (let i = 0; i < numActive; i++) {
            const playerId = reader.uint8();
            const consoleId = reader.uint8();
            const player = this.room.getPlayerByPlayerId(playerId);
            if (player) {
                this._openConsole(consoleId, player, undefined);
            }
        }

        for (const [playerId, consoleId] of beforeActive) {
            const player = this.ship.room.getPlayerByPlayerId(playerId);
            if (player) {
                this._closeConsole(consoleId, player, undefined);
            }
        }

        const numCompleted = reader.packed();
        const beforeCompleted = this.completedConsoles;
        this.completedConsoles = new Set;
        for (let i = 0; i < numCompleted; i++) {
            const consoleId = reader.uint8();
            this._completeConsole(consoleId, undefined, undefined);
        }
        if (beforeCompleted.size === 2 && numCompleted === 0) {
            this.emitSync(
                new SystemSabotageEvent(
                    this.room,
                    this,
                    undefined,
                    undefined
                )
            );
        }
        if (beforeCompleted.size < 2 && numCompleted === 2) {
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
        writer.float(this.countdown);
        writer.float(this.resetTimer);
        writer.packed(this.activeConsoles.size);
        for (const [playerId, consoleId] of this.activeConsoles) {
            writer.uint8(playerId);
            writer.uint8(consoleId);
        }
        writer.packed(this.completedConsoles.size);
        for (const consoleId of this.completedConsoles) {
            writer.uint8(consoleId);
        }
    }

    async handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        this.countdown = 90;
        this.resetTimer = -1;
        this.activeConsoles = new Map;
        this.completedConsoles = new Set;
        this.dirty = true;

        await this.emit(
            new SystemSabotageEvent(
                this.room,
                this,
                rpc,
                player
            )
        );
    }

    private async _resetConsoles() {
        const oldCompleted = this.completedConsoles;
        this.completedConsoles = new Set;
        this.dirty = true;

        const ev = await this.emit(
            new HeliSabotageConsolesResetEvent(
                this.room,
                this
            )
        );

        if (ev.reverted) {
            this.completedConsoles = oldCompleted;
        }
    }

    private async _openConsole(consoleId: number, player: Player<RoomType>, rpc: RepairSystemMessage | undefined) {
        const playerId = player.getPlayerId();
        if (playerId === undefined) return;

        if (this.activeConsoles.has(playerId))
            return;

        this.activeConsoles.set(playerId, consoleId);
        this.dirty = true;
        const ev = await this.emit(
            new HeliSabotageConsoleOpenEvent(
                this.room,
                this,
                rpc,
                player,
                consoleId
            )
        );
        if (ev.reverted) {
            this.activeConsoles.delete(playerId);
            return;
        }
        if (ev.alteredConsoleId !== consoleId) {
            this.activeConsoles.set(playerId, ev.alteredConsoleId);
        }
    }

    async openConsolePlayer(consoleId: number, openedByPlayer: Player<RoomType>) {
        await this._openConsole(consoleId, openedByPlayer, undefined);
    }

    /**
     * Mark the console as being used by your player.
     * @param consoleId The ID of the console to mark as being used.
     */
    async openConsole(consoleId: number) {
        this._sendRepair(0x40 | consoleId);
    }

    private async _closeConsole(consoleId: number, player: Player<RoomType>, rpc: RepairSystemMessage | undefined) {
        const playerId = player.getPlayerId();
        if (playerId === undefined) return;

        if (!this.activeConsoles.delete(playerId))
            return;

        this.dirty = true;
        const ev = await this.emit(
            new HeliSabotageConsoleCloseEvent(
                this.room,
                this,
                rpc,
                player,
                consoleId
            )
        );
        if (ev.reverted) {
            this.activeConsoles.delete(playerId);
        }
    }

    async closeConsolePlayer(consoleId: number, closedByPlayer: Player<RoomType>) {
        await this._closeConsole(consoleId, closedByPlayer, undefined);
    }

    /**
     * Mark the console as no longer being used by your player.
     * @param consoleId The ID of the console to mark as not being used.
     */
    async closeConsole(consoleId: number) {
        await this._sendRepair(0x20 | consoleId);
    }

    private async _completeConsole(consoleId: number, player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        if (!this.completedConsoles.has(consoleId)) {
            this.completedConsoles.add(consoleId);
            this.dirty = true;
            const ev = await this.emit(
                new HeliSabotageConsoleCompleteEvent(
                    this.room,
                    this,
                    rpc,
                    player,
                    consoleId
                )
            );
            if (ev.reverted) {
                this.completedConsoles.delete(consoleId);
            }
        }
    }

    /**
     * Mark a console as completed.
     * @param consoleId The ID of the console to mark as completed.
     */
    async completeConsolePlayer(consoleId: number, completedByPlayer: Player<RoomType>) {
        await this._completeConsole(consoleId, completedByPlayer, undefined);
    }

    async completeConsole(consoleId: number) {
        await this._sendRepair(0x10 | consoleId);
    }

    private async _repair(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        const completedBefore = this.completedConsoles;
        const timerBefore = this.resetTimer;
        const countdownBefore = this.countdown;
        this.completedConsoles = new Set([0, 1]);
        this.resetTimer = -1;
        this.countdown = 10000;
        this.dirty = true;
        const ev = await this.emit(
            new SystemRepairEvent(
                this.room,
                this,
                rpc,
                player
            )
        );
        if (ev.reverted) {
            this.resetTimer = timerBefore;
            this.completedConsoles = completedBefore;
            this.countdown = countdownBefore;
        }
    }

    async fullyRepairHost(): Promise<void> {
        await this._repair(undefined, undefined);
    }

    async fullyRepairPlayer(repairedBy: Player<RoomType>) {
        await this._repair(repairedBy, undefined);
    }

    async sendFullRepair() {
        await this.completeConsole(0);
        await this.completeConsole(1);
    }

    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined) {
        const consoleId = amount & 0xf;
        const repairOperation = amount & 0xf0;

        switch (repairOperation) {
            case HeliSabotageSystemRepairTag.DeactiveBit:
                if (!player)
                    return;

                this._closeConsole(consoleId, player, rpc);
                break;
            case HeliSabotageSystemRepairTag.ActiveBit:
                if (!player)
                    return;

                this._openConsole(consoleId, player, rpc);
                break;
            case HeliSabotageSystemRepairTag.DamageBit:
                this.handleSabotageByPlayer(player, rpc);
                break;
            case HeliSabotageSystemRepairTag.FixBit:
                this._completeConsole(consoleId, player, rpc);
                break;
        }
    }

    async processFixedUpdate(delta: number) {
        if (!this.sabotaged)
            return;

        this.resetTimer -= delta;
        this.countdown -= delta;
        if (this.resetTimer < 0) {
            this.resetTimer = 10;

            this._resetConsoles();
        }

        this._syncTimer -= delta;
        if (this._syncTimer <= 0) {
            this._syncTimer = 1;
            this.dirty = true;
        }
    }
}
