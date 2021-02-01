import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

export interface LifeSuppSystemData {
    timer: number;
    completed: number[];
}

export type LifeSuppSystemEvents = {
    consoleCompleted: (consoleId: number) => void;
    consolesCleared: () => void;
    systemSabotage: () => void;
    systemRepair: () => void;
}

export class LifeSuppSystem extends SystemStatus<LifeSuppSystemEvents> {
    static systemType = SystemType.O2 as const;
    systemType = SystemType.O2 as const;

    timer: number;
    completed: number[];

    constructor(ship: BaseShipStatus, data?: HazelBuffer|LifeSuppSystemData) {
        super(ship, data);
    }

    get sabotaged() {
        return this.timer < 10000;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        this.timer = reader.float();

        const num_consoles = reader.upacked();
        this.completed = [];
        for (let i = 0; i < num_consoles; i++) {
            this.completed.push(reader.upacked());
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

    HandleSabotage(control: PlayerData) {
        this.HandleRepair(control, 0x80);
    }

    HandleRepair(control: PlayerData, amount: number) {
        const consoleId = amount & 0x3;

        if (amount & 0x80) {
            this.timer = 45;
            this.completed.splice(0);
        } else if (amount & 0x40) {
            this.completed.push(consoleId);
        } else if (amount & 0x10) {
            this.timer = 10000;
            this.completed.splice(0);
        }

        this.dirty = true;
    }

    private lastUpdate = 0;

    Detoriorate(delta: number) {
        if (!this.sabotaged)
            return;

        this.timer -= delta;

        if (this.completed.length >= 2) {
            this.timer = 10000;
            return;
        }

        this.lastUpdate += delta;

        if (this.lastUpdate > 2) {
            this.lastUpdate = 0;
            this.dirty = true;
        }
    }
}
