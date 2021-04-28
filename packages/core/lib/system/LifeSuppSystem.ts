import { HazelReader, HazelWriter } from "@skeldjs/util";

import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import {
    O2ConsoleClearEvent,
    O2ConsoleCompleteEvent,
    SystemRepairEvent,
    SystemSabotageEvent,
} from "../events";
import { ExtractEventTypes } from "@skeldjs/events";
import { SystemStatusEvents } from "./events";

export interface LifeSuppSystemData {
    timer: number;
    completed: Set<number>;
}

export type LifeSuppSystemEvents =
    SystemStatusEvents &
ExtractEventTypes<[
    O2ConsoleClearEvent,
    O2ConsoleCompleteEvent
]>;

/**
 * Represents a system responsible for handling oxygen consoles.
 *
 * See {@link LifeSuppSystemEvents} for events to listen to.
 */
export class LifeSuppSystem extends SystemStatus<
    LifeSuppSystemData,
    LifeSuppSystemEvents
> {
    static systemType = SystemType.O2 as const;
    systemType = SystemType.O2 as const;

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
        ship: InnerShipStatus,
        data?: HazelReader | LifeSuppSystemData
    ) {
        super(ship, data);

        this.completed ||= new Set();
    }

    get sabotaged() {
        return this.timer < 10000;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const timer = this.timer;
        this.timer = reader.float();

        if (timer === 10000 && this.timer < 10000) {
            this.emit(new SystemSabotageEvent(this.ship?.room, this));
        } else if (timer < 10000 && this.timer === 10000) {
            this.emit(new SystemRepairEvent(this.ship?.room, this));
        }

        const num_consoles = reader.upacked();
        if (this.completed.size > 0 && num_consoles === 0) {
            this._clearConsoles();
        } else {
            for (let i = 0; i < num_consoles; i++) {
                const consoleId = reader.upacked();
                this._completeConsole(consoleId);
            }
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.float(this.timer);

        const completed = [...this.completed];
        writer.upacked(completed.length);
        for (let i = 0; i < completed.length; i++) {
            writer.upacked(completed[i]);
        }
    }

    HandleSabotage(player: PlayerData) {
        this.HandleRepair(player, 0x80);
    }

    private _clearConsoles() {
        this.completed.clear();
        this.dirty = true;
        this.emit(new O2ConsoleClearEvent(this.ship?.room, this));
    }

    private _completeConsole(consoleid: number, player?: PlayerData) {
        if (!this.completed.has(consoleid)) {
            this.completed.add(consoleid);
            this.dirty = true;
            this.emit(
                new O2ConsoleCompleteEvent(
                    this.ship?.room,
                    this,
                    consoleid,
                    player
                )
            );
        }
    }

    /**
     * Mark a console as being complete.
     * @param consoleId The ID of the console to mark as complete.
     */
    completeConsole(consoleId: number) {
        this.repair(this.ship.room.me, (consoleId & 0x3) | 0x40);
    }

    private _fix(player: PlayerData) {
        this.timer = 10000;
        this.dirty = true;
        this.emit(new SystemRepairEvent(this.ship?.room, this, player));
        this._clearConsoles();
    }

    fix() {
        this.repair(this.ship.room.me, 0x10);
    }

    HandleRepair(player: PlayerData, amount: number) {
        const consoleId = amount & 0x3;

        if (amount & 0x80) {
            this.timer = 45;
            this._clearConsoles();
        } else if (amount & 0x40) {
            this._completeConsole(consoleId, player);
            if (this.completed.size >= 2) {
                this._fix(player);
            }
        } else if (amount & 0x10) {
            this._fix(player);
        }
    }

    Detoriorate(delta: number) {
        if (!this.sabotaged) return;

        this.timer -= delta;
        this.lastUpdate += delta;

        if (this.lastUpdate > 2) {
            this.lastUpdate = 0;
            this.dirty = true;
        }
    }
}
