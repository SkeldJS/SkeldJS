import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import {
    HqHudConsoleOpenEvent,
    HqHudConsoleResetEvent,
    HqHudConsoleCloseEvent,
    HqHudConsoleCompleteEvent,
    SystemSabotageEvent,
    SystemRepairEvent,
} from "../events";
import { ExtractEventTypes } from "@skeldjs/events";
import { SystemStatusEvents } from "./events";

export interface UserConsolePair {
    playerid: number;
    consoleid: number;
}

export interface HqHudSystemData {
    active: UserConsolePair[];
    completed: Set<number>;
}

export type HqHudSystemEvents =
    SystemStatusEvents &
ExtractEventTypes<[
    HqHudConsoleResetEvent,
    HqHudConsoleOpenEvent,
    HqHudConsoleCloseEvent,
    HqHudConsoleCompleteEvent
]>;

export const HqHudSystemRepairTag = {
    CompleteConsole: 0x10,
    CloseConsole: 0x20,
    OpenConsole: 0x40,
    Sabotage: 0x80,
} as const;

/**
 * Represents a system responsible for handling communication consoles on Mira HQ.
 *
 * See {@link HqHudSystemEvents} for events to listen to.
 */
export class HqHudSystem extends SystemStatus<
    HqHudSystemData,
    HqHudSystemEvents
> {
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

    constructor(ship: InnerShipStatus, data?: HazelReader | HqHudSystemData) {
        super(ship, data);
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
                this._openConsole(consoleId, player);
            }
        }

        for (let i = 0; i < before_active.length; i++) {
            const console = before_active[i];
            const idx = this._getIdx(console.consoleid, console.playerid);
            const player = this.ship.room.getPlayerByPlayerId(console.playerid);
            if (player && idx === -1) {
                this._closeConsole(console.consoleid, player);
            }
        }

        const before_completed = this.completed.size;
        const num_completed = reader.upacked();
        for (let i = 0; i < num_completed; i++) {
            this._completeConsole(reader.uint8());
        }
        if (before_completed === 2 && num_completed === 0) {
            this.emit(new SystemSabotageEvent(this.ship?.room, this));
        }
        if (before_completed < 2 && num_completed === 2) {
            this.emit(new SystemRepairEvent(this.ship?.room, this));
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

    HandleSabotage(player: PlayerData) {
        this.HandleRepair(player, 0x80);
    }

    private _resetConsoles() {
        this.completed.clear();
        this.dirty = true;
        this.emit(new HqHudConsoleResetEvent(this.ship?.room, this));
    }

    private _openConsole(consoleid: number, player: PlayerData) {
        const idx = this._getIdx(consoleid, player.playerId);

        if (idx === -1) {
            this.active.push({ consoleid, playerid: player.playerId });
            this.dirty = true;
            this.emit(
                new HqHudConsoleOpenEvent(
                    this.ship?.room,
                    this,
                    consoleid,
                    player
                )
            );
        }
    }

    private _closeConsole(consoleid: number, player: PlayerData) {
        const idx = this._getIdx(consoleid, player.playerId);

        if (idx > -1) {
            this.active.push({ consoleid, playerid: player.playerId });
            this.dirty = true;
            this.emit(
                new HqHudConsoleCloseEvent(
                    this.ship?.room,
                    this,
                    consoleid,
                    player
                )
            );
        }
    }

    private _completeConsole(consoleid: number, player?: PlayerData) {
        if (!this.completed.has(consoleid)) {
            this.completed.add(consoleid);
            this.dirty = true;
            this.emit(
                new HqHudConsoleCompleteEvent(
                    this.ship?.room,
                    this,
                    consoleid,
                    player
                )
            );
        }
    }

    private _fix() {
        this.completed.add(0).add(1);
        this.emit(new SystemRepairEvent(this.ship?.room, this));
    }

    /**
     * Mark the console as being used by your player.
     * @param consoleId The ID of the console to mark as being used.
     */
    openConsole(consoleId: number) {
        this.repair(
            this.ship.room.me,
            (consoleId & 0xf) | HqHudSystemRepairTag.OpenConsole
        );
    }

    /**
     * Mark the console as no longer being used by your player.
     * @param consoleId The ID of the console to mark as not being used.
     */
    closeConsole(consoleId: number) {
        this.repair(
            this.ship.room.me,
            (consoleId & 0xf) | HqHudSystemRepairTag.CloseConsole
        );
    }

    /**
     * Mark a console as completed.
     * @param consoleId The ID of the console to mark as completed.
     */
    completeConsole(consoleId: number) {
        this.repair(
            this.ship.room.me,
            (consoleId & 0xf) | HqHudSystemRepairTag.CompleteConsole
        );
    }

    fix() {
        this.completeConsole(0);
        this.completeConsole(1);
    }

    HandleRepair(player: PlayerData, amount: number) {
        const consoleId = amount & 0xf;
        const tags = amount & 0xf0;

        switch (tags) {
            case HqHudSystemRepairTag.CompleteConsole:
                this._completeConsole(consoleId, player);
                if (this.completed.size >= 2) this._fix();
                break;
            case HqHudSystemRepairTag.CloseConsole:
                this._closeConsole(consoleId, player);
                break;
            case HqHudSystemRepairTag.OpenConsole:
                this._openConsole(consoleId, player);
                break;
            case HqHudSystemRepairTag.Sabotage:
                this.timer = -1;
                this.active.splice(0);
                this.completed.clear();
                this.dirty = true;
                this.emit(new SystemSabotageEvent(this.ship?.room, this));
                break;
        }
    }

    Detoriorate(delta: number) {
        this.timer -= delta;
        if (this.timer < 0) {
            this.timer = 10;
            this.dirty = true;
            this._resetConsoles();
        }
    }
}
