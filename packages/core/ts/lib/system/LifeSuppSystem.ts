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

export type LifeSuppSystemEvents = BaseSystemStatusEvents & {
    "o2.consoles.complete": { player?: PlayerData; consoleId: number };
    "o2.consoles.clear": { player?: PlayerData };
};

export class LifeSuppSystem extends SystemStatus<LifeSuppSystemData, LifeSuppSystemEvents> {
    static systemType = SystemType.O2 as const;
    systemType = SystemType.O2 as const;

    private lastUpdate = 0;

    timer: number;
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

    private _clearConsoles(player?: PlayerData) {
        this.completed.clear();
        this.dirty = true;
        this.emit("o2.consoles.clear", { player });
    }

    private _completeConsole(consoleId: number, player?: PlayerData) {
        if (!this.completed.has(consoleId)) {
            this.completed.add(consoleId);
            this.dirty = true;
            this.emit("o2.consoles.complete", { player, consoleId });
        }
    }

    completeConsole(consoleId: number) {
        this.repair(this.ship.room.me, (consoleId & 0x3) | 0x40);
    }

    private _fix(player: PlayerData) {
        this.timer = 10000;
        this.dirty = true;
        this.emit("system.repair", { player });
        this._clearConsoles(player);
    }

    fix() {
        this.repair(this.ship.room.me, 0x10);
    }

    HandleRepair(player: PlayerData, amount: number) {
        const consoleId = amount & 0x3;

        if (amount & 0x80) {
            this.timer = 45;
            this._clearConsoles(player);
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
