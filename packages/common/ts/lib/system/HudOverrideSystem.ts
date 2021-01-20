import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

export interface HudOverrideSystemData {
    sabotaged: boolean;
}

export class HudOverrideSystem extends SystemStatus {
    static systemType = SystemType.Communications as const;
    systemType = SystemType.Communications as const;
    
    sabotaged: boolean;

    constructor(ship: BaseShipStatus, data?: HazelBuffer|HudOverrideSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const before = this.sabotaged;
        this.sabotaged = reader.bool();

        if (!before && this.sabotaged)
            this.emit("systemSabotage");

        if (before && !this.sabotaged)
            this.emit("systemRepair");
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.bool(this.sabotaged);
    }

    HandleRepair(control: PlayerData, amount: number) {
        if (amount === 0) {
            this.sabotaged = false;
        }
    }
}