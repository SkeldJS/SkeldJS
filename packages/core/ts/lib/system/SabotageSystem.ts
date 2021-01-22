import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

export interface SabotageSystemData {
    cooldown: number;
}

export type SabotageSystemEvents = {

}

export class SabotageSystem extends SystemStatus<SabotageSystemEvents> {
    static systemType = SystemType.Sabotage as const;
    systemType = SystemType.Sabotage as const;
    
    cooldown: number;

    constructor(ship: BaseShipStatus, data?: HazelBuffer|SabotageSystemData) {
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

    HandleRepair(control: PlayerData, amount: number) {
        const system = this.ship.systems[amount] as SystemStatus;

        if (system) {
            system.sabotage(control);
        }
    }
}