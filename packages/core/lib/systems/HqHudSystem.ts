import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import {
    HqHudConsoleOpenEvent,
    HqHudConsoleCloseEvent,
    HqHudConsoleCompleteEvent,
    HqHudConsolesResetEvent,
    SystemSabotageEvent,
    SystemRepairEvent,
} from "../events";
import { ExtractEventTypes } from "@skeldjs/events";
import { SystemStatusEvents } from "./events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../Hostable";

export interface UserConsolePair {
    playerid: number;
    consoleid: number;
}

export interface HqHudSystemData {
    active: UserConsolePair[];
    completed: Set<number>;
}

export type HqHudSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<
        [
            HqHudConsolesResetEvent<RoomType>,
            HqHudConsoleOpenEvent<RoomType>,
            HqHudConsoleCloseEvent<RoomType>,
            HqHudConsoleCompleteEvent<RoomType>
        ]
    >;

export const HqHudSystemRepairTag = {
    CompleteConsole: 0x10,
    CloseConsole: 0x20,
    OpenConsole: 0x40
} as const;

/**
 * Represents a system responsible for handling communication consoles on Mira HQ.
 *
 * See {@link HqHudSystemEvents} for events to listen to.
 */
export class HqHudSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    HqHudSystemData,
    HqHudSystemEvents,
    RoomType
> implements HqHudSystemData {
    static systemType = SystemType.Communications as const;
    systemType = SystemType.Communications as const;

    /**
     * The timer until the consoles are reset.
     */
    timer: number;

    /**
     * The currently opened consoles.
     */
    active: UserConsolePair[];

    /**
     * The completed consoles.
     */
    completed: Set<number>;

    get sabotaged() {
        return this.completed.size < 2;
    }

    constructor(ship: InnerShipStatus<RoomType>, data?: HazelReader | HqHudSystemData) {
        super(ship, data);

        this.timer ??= 10000;
        this.active ||= [];
        this.completed ||= new Set;
    }

    private _getIdx(consoleId: number, playerId: number) {
        return this.active.findIndex(
            (pair) => pair.consoleid === consoleId && pair.playerid === playerId
        );
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const num_active = reader.upacked();

        const before_active = this.active;
        this.active = [];
        for (let i = 0; i < num_active; i++) {
            const playerId = reader.uint8();
            const consoleId = reader.uint8();

            const player = this.ship.room.getPlayerByPlayerId(playerId);
            if (player) {
                this._openConsole(consoleId, player, undefined);
            }
        }

        for (let i = 0; i < before_active.length; i++) {
            const console = before_active[i];
            const idx = this._getIdx(console.consoleid, console.playerid);
            const player = this.ship.room.getPlayerByPlayerId(console.playerid);
            if (player && idx === -1) {
                this._closeConsole(console.consoleid, player, undefined);
            }
        }

        const before_completed = this.completed.size;
        const num_completed = reader.upacked();
        for (let i = 0; i < num_completed; i++) {
            this._completeConsole(reader.uint8(), undefined, undefined);
        }
        if (before_completed === 2 && num_completed === 0) {
            this.emit(
                new SystemSabotageEvent(
                    this.room,
                    this,
                    undefined,
                    undefined
                )
            );
        }
        if (before_completed < 2 && num_completed === 2) {
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
        writer.upacked(this.active.length);

        for (let i = 0; i < this.active.length; i++) {
            const active = this.active[i];

            writer.uint8(active.playerid);
            writer.uint8(active.consoleid);
        }

        const completed = [...this.completed];
        writer.upacked(completed.length);

        for (let i = 0; i < completed.length; i++) {
            writer.uint8(completed[i]);
        }
    }

    async HandleSabotage(player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        const oldTimer = this.timer;
        const oldActive = this.active;
        const oldCompleted = this.completed;
        this.timer = -1;
        this.active = [];
        this.completed = new Set;
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
            this.timer = oldTimer;
            this.active = oldActive;
            this.completed = oldCompleted;
        }
    }

    private async _resetConsoles(player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        const oldCompleted = this.completed;
        this.completed = new Set;
        this.dirty = true;

        const ev = await this.emit(
            new HqHudConsolesResetEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.completed = oldCompleted;
        }
    }

    private async _openConsole(consoleid: number, player: PlayerData, rpc: RepairSystemMessage|undefined) {
        if (player.playerId === undefined)
            return;

        const idx = this._getIdx(consoleid, player.playerId);

        if (idx === -1) {
            const consoleEntry = { consoleid, playerid: player.playerId };
            this.active.push(consoleEntry);
            this.dirty = true;
            const ev = await this.emit(
                new HqHudConsoleOpenEvent(
                    this.room,
                    this,
                    rpc,
                    player,
                    consoleid
                )
            );
            if (ev.reverted) {
                const newIdx = this.active.indexOf(consoleEntry);
                if (newIdx > -1) this.active.splice(newIdx, 1);
                return;
            }
            if (ev.alteredConsoleId !== consoleid) {
                consoleEntry.consoleid = ev.alteredConsoleId;
            }
        }
    }

    /**
     * Mark the console as being used by your player.
     * @param consoleId The ID of the console to mark as being used.
     */
    async openConsole(consoleId: number) {
        if (!this.room.me)
            return;

        if (this.room.amhost) {
            this._openConsole(consoleId, this.room.me, undefined);
        } else {
            this._sendRepair(0x40 | consoleId);
        }
    }

    private async _closeConsole(consoleid: number, player: PlayerData, rpc: RepairSystemMessage|undefined) {
        if (player.playerId === undefined)
            return;

        const idx = this._getIdx(consoleid, player.playerId);

        if (idx > -1) {
            const consoleEntry = this.active[idx];
            this.active.splice(idx, 1);
            this.dirty = true;
            const ev = await this.emit(
                new HqHudConsoleCloseEvent(
                    this.room,
                    this,
                    rpc,
                    player,
                    consoleid
                )
            );
            if (ev.reverted) {
                this.active.splice(idx, 0, consoleEntry);
            }
        }
    }

    /**
     * Mark the console as no longer being used by your player.
     * @param consoleId The ID of the console to mark as not being used.
     */
    async closeConsole(consoleId: number) {
        if (!this.room.me)
            return;

        if (this.room.amhost) {
            await this._closeConsole(consoleId, this.room.me, undefined);
        } else {
            await this._sendRepair(0x20 | consoleId);
        }
    }

    private async _completeConsole(consoleid: number, player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        if (!this.completed.has(consoleid)) {
            this.completed.add(consoleid);
            this.dirty = true;
            const ev = await this.emit(
                new HqHudConsoleCompleteEvent(
                    this.room,
                    this,
                    rpc,
                    player,
                    consoleid
                )
            );
            if (ev.reverted) {
                this.completed.delete(consoleid);
            }
        }
    }

    /**
     * Mark a console as completed.
     * @param consoleId The ID of the console to mark as completed.
     */
    async completeConsole(consoleId: number) {
        if (this.room.amhost) {
            await this._completeConsole(consoleId, this.room.me, undefined);
        } else {
            await this._sendRepair(0x10 | consoleId);
        }
    }

    private async _repair(player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        const completedBefore = this.completed;
        this.completed = new Set([0, 1]);
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
            this.completed = completedBefore;
        }
    }

    async repair() {
        if (this.room.amhost) {
            await this._repair(this.room.me, undefined);
        } else {
            await this.completeConsole(0);
            await this.completeConsole(1);
        }
    }

    async HandleRepair(player: PlayerData, amount: number, rpc: RepairSystemMessage|undefined|undefined) {
        const consoleId = amount & 0xf;
        const repairOperation = amount & 0xf0;

        switch (repairOperation) {
            case HqHudSystemRepairTag.CompleteConsole:
                await this._completeConsole(consoleId, player, rpc);
                if (this.completed.size >= 2) {
                    await this._repair(player, rpc);
                }
                break;
            case HqHudSystemRepairTag.CloseConsole:
                await this._closeConsole(consoleId, player, rpc);
                break;
            case HqHudSystemRepairTag.OpenConsole:
                await this._openConsole(consoleId, player, rpc);
                break;
        }
    }

    Detoriorate(delta: number) {
        this.timer -= delta;
        if (this.timer < 0) {
            this.timer = 10;
            this.dirty = true;
            this._resetConsoles(undefined, undefined);
        }
    }
}
