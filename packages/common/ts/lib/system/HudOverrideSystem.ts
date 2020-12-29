import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { ShipStatus } from "../component/ShipStatus";
import { SystemStatus } from "./SystemStatus";

export interface HudOverrideSystemData {
    sabotaged: boolean;
}

export class HudOverrideSystem extends SystemStatus {
    static systemType = SystemType.Communications as const;
    systemType = SystemType.Communications as const;
    
    sabotaged: boolean;

    constructor(ship: ShipStatus, data?: HazelBuffer|HudOverrideSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        this.sabotaged = reader.bool();
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.bool(this.sabotaged);
    }
}