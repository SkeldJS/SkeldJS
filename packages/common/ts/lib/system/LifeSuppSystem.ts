import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { ShipStatus } from "../component/ShipStatus";
import { SystemStatus } from "./SystemStatus";

export interface LifeSuppSystemData {
    timer: number;
    completed: number[];
}

export class LifeSuppSystem extends SystemStatus {
    static systemType = SystemType.O2 as const;
    systemType = SystemType.O2 as const;
    
    timer: number;
    completed: number[];

    constructor(ship: ShipStatus, data?: HazelBuffer|LifeSuppSystemData) {
        super(ship, data);
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

        for (let i = 0; i < this.completed.length; i++) {
            writer.upacked(this.completed[i]);
        }
    }
}