import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { ShipStatus } from "../component/ShipStatus";
import { SystemStatus } from "./SystemStatus";

export interface SabotageSystemData {
    cooldown: number;
}

export class SabotageSystem extends SystemStatus {
    static systemType = SystemType.Sabotage as const;
    systemType = SystemType.Sabotage as const;
    
    cooldown: number;

    constructor(ship: ShipStatus, data?: HazelBuffer|SabotageSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        this.cooldown = reader.float();
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.float(this.cooldown);
    }
}