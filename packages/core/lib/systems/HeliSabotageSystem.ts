import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import {
    HeliSabotageConsoleOpenEvent,
    HeliSabotageConsolesResetEvent,
    HeliSabotageConsoleCloseEvent,
    HeliSabotageConsoleCompleteEvent,
    SystemRepairEvent,
    SystemSabotageEvent
} from "../events";

import { SystemStatusEvents } from "./events";
import { Hostable } from "../Hostable";

export interface HeliSabotageSystemData {
    countdown: number;
    resetTimer: number;
    activeConsoles: Map<number, number>;
    completedConsoles: Set<number>
}

export type HeliSabotageSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[
        HeliSabotageConsoleOpenEvent,
        HeliSabotageConsolesResetEvent,
        HeliSabotageConsoleCloseEvent,
        HeliSabotageConsoleCompleteEvent
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
export class HeliSabotageSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    HeliSabotageSystemData,
    HeliSabotageSystemEvents,
    RoomType
> implements HeliSabotageSystemData {
    private _syncTimer: number;

    countdown: number;
    resetTimer: number;
    activeConsoles: Map<number, number>;
    completedConsoles: Set<number>

    /**
     * Whether or not communications is sabotaged.
     */
    get sabotaged() {
        return this.completedConsoles.size < 2;
    }

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | HeliSabotageSystemData
    ) {
        super(ship, systemType, data);

        this._syncTimer = 1;

        this.countdown ??= 10000;
        this.resetTimer ??= -1;
        this.activeConsoles ??= new Map;
        this.completedConsoles ??= new Set([0, 1]);
    }

    patch(data: HeliSabotageSystemData) {
        this.countdown = data.countdown;
        this.resetTimer = data.resetTimer;
        this.activeConsoles = data.activeConsoles;
        this.completedConsoles = data.completedConsoles;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
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

        for (const [ playerId, consoleId ] of beforeActive) {
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
            this.emit(
                new SystemSabotageEvent(
                    this.room,
                    this,
                    undefined,
                    undefined
                )
            );
        }
        if (beforeCompleted.size < 2 && numCompleted === 2) {
            this.emit(
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
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.float(this.countdown);
        writer.float(this.resetTimer);
        writer.packed(this.activeConsoles.size);
        for (const [ playerId, consoleId ] of this.activeConsoles) {
            writer.uint8(playerId);
            writer.uint8(consoleId);
        }
        writer.packed(this.completedConsoles.size);
        for (const consoleId of this.completedConsoles) {
            writer.uint8(consoleId);
        }
    }

    async HandleSabotage(player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        const oldCountdown = 10000;
        const oldTimer = this.resetTimer;
        const oldActive = this.activeConsoles;
        const oldCompleted = this.completedConsoles;
        this.countdown = 90;
        this.resetTimer = -1;
        this.activeConsoles = new Map;
        this.completedConsoles = new Set;
        this.dirty = true;

        const ev = await this.emit(
            new SystemSabotageEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.countdown = oldCountdown;
            this.resetTimer = oldTimer;
            this.activeConsoles = oldActive;
            this.completedConsoles = oldCompleted;
        }
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

    private async _openConsole(consoleId: number, player: PlayerData, rpc: RepairSystemMessage|undefined) {
        if (player.playerId === undefined)
            return;

        if (this.activeConsoles.has(player.playerId))
            return;

        this.activeConsoles.set(player.playerId, consoleId);
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
            this.activeConsoles.delete(player.playerId);
            return;
        }
        if (ev.alteredConsoleId !== consoleId) {
            this.activeConsoles.set(player.playerId, ev.alteredConsoleId);
        }
    }

    async openConsoleAs(consoleId: number, player: PlayerData) {
        await this._openConsole(consoleId, player, undefined);
    }

    /**
     * Mark the console as being used by your player.
     * @param consoleId The ID of the console to mark as being used.
     */
    async openConsole(consoleId: number) {
        if (!this.room.myPlayer)
            return;

        if (this.room.hostIsMe) {
            await this.openConsoleAs(consoleId, this.room.myPlayer);
        } else {
            this._sendRepair(0x40 | consoleId);
        }
    }

    private async _closeConsole(consoleid: number, player: PlayerData, rpc: RepairSystemMessage|undefined) {
        if (player.playerId === undefined)
            return;

        if (!this.activeConsoles.delete(player.playerId))
            return;

        this.dirty = true;
        const ev = await this.emit(
            new HeliSabotageConsoleCloseEvent(
                this.room,
                this,
                rpc,
                player,
                consoleid
            )
        );
        if (ev.reverted) {
            this.activeConsoles.delete(player.playerId);
        }
    }

    async closeConsoleAs(consoleId: number, player: PlayerData) {
        await this._closeConsole(consoleId, player, undefined);
    }

    /**
     * Mark the console as no longer being used by your player.
     * @param consoleId The ID of the console to mark as not being used.
     */
    async closeConsole(consoleId: number) {
        if (!this.room.myPlayer)
            return;

        if (this.room.hostIsMe) {
            await this.closeConsoleAs(consoleId, this.room.myPlayer);
        } else {
            await this._sendRepair(0x20 | consoleId);
        }
    }

    private async _completeConsole(consoleId: number, player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
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
    async completeConsole(consoleId: number) {
        if (this.room.hostIsMe) {
            await this._completeConsole(consoleId, this.room.myPlayer, undefined);
        } else {
            await this._sendRepair(0x10 | consoleId);
        }
    }

    async _repair(player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
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
        if(ev.reverted) {
            this.resetTimer = timerBefore;
            this.completedConsoles = completedBefore;
            this.countdown = countdownBefore;
        }
    }

    async repair() {
        if (this.room.hostIsMe) {
            await this._repair(this.room.myPlayer, undefined);
        } else {
            await this.completeConsole(0);
            await this.completeConsole(1);
        }
    }

    async HandleRepair(player: PlayerData<RoomType>|undefined, amount: number, rpc: RepairSystemMessage|undefined) {
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
                this.HandleSabotage(player, rpc);
                break;
            case HeliSabotageSystemRepairTag.FixBit:
                this._completeConsole(consoleId, player, rpc);
                break;
        }
    }

    Detoriorate(delta: number) {
        if (!this.sabotaged)
            return;

        this.resetTimer -= delta;
        if (this.resetTimer < 0) {
            this.resetTimer = 10;
            this.countdown -= delta;

            this._resetConsoles();

            this._syncTimer -= delta;
            if (this._syncTimer <= 0) {
                this._syncTimer = 1;
                this.dirty = true;
            }
        }
    }
}
