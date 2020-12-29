import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { ShipStatus } from "../component/ShipStatus";
import { SystemStatus } from "./SystemStatus";

export interface MedScanSystemData {
    queue: number[];
}

export class MedScanSystem extends SystemStatus {
    static systemType = SystemType.MedBay as const;
    systemType = SystemType.MedBay as const;

    queue: number[];

    constructor(ship: ShipStatus, data?: HazelBuffer|MedScanSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const num_players = reader.upacked();

        this.queue = [];
        for (let i = 0; i < num_players; i++) {
            this.queue.push(reader.uint8());
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.upacked(this.queue.length);

        for (let i = 0; i < this.queue.length; i++) {
            writer.uint8(this.queue[i]);
        }
    }
}