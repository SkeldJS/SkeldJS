import { HazelBuffer } from "@skeldjs/util";

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { BaseSystemStatusEvents } from "./events";

export interface LifeSuppSystemData {
    timer: number;
    completed: Set<number>;
}

export interface LifeSuppSystemEvents extends BaseSystemStatusEvents {
    /**
     * Emitted when an O2 console is completed.
     */
    "o2.consoles.complete": {
        /**
         * The player that completed the console, only known if the current client is the host.
         */
        player?: PlayerData;
        /**
         * The ID of the console that was completed.
         */
        consoleId: number
    };
    /**
     * Emitted when the O2 consoles are cleared.
     */
    "o2.consoles.clear": {};
}

/**
 * Represents a system responsible for handling oxygen consoles.
 *
 * See {@link LifeSuppSystemEvents} for events to listen to.
 */
export class LifeSuppSystem extends SystemStatus<LifeSuppSystemData, LifeSuppSystemEvents> {
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

    constructor(ship: BaseShipStatus, data?: HazelBuffer | LifeSuppSystemData) {
        super(ship, data);

        this.completed ||= new Set();
    }

    get sabotaged() {
        return this.timer < 10000;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const timer = this.timer;
        this.timer = reader.float();

        if (timer === 10000 && this.timer < 10000) {
            this.emit("system.sabotage", {});
        } else if (timer < 10000 && this.timer === 10000) {
            this.emit("system.repair", {});
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
    Serialize(writer: HazelBuffer, spawn: boolean) {
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
        this.emit("o2.consoles.clear", {});
    }

    private _completeConsole(consoleId: number, player?: PlayerData) {
        if (!this.completed.has(consoleId)) {
            this.completed.add(consoleId);
            this.dirty = true;
            this.emit("o2.consoles.complete", { player, consoleId });
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
        this.emit("system.repair", { player });
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
