import { HazelBuffer } from "@skeldjs/util"

import { SystemType, MapDoors } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";

export interface DoorsSystemData {
    cooldowns: Map<number, number>;
    doors: boolean[];
}

export class DoorsSystem extends SystemStatus {
    static systemType = SystemType.Doors as const;
    systemType = SystemType.Doors as const;
    
    cooldowns: Map<number, number>;
    doors: boolean[];

    constructor(ship: BaseShipStatus, data?: HazelBuffer|DoorsSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const num_cooldown = reader.upacked();

        for (let i = 0; i < num_cooldown; i++) {
            const doorId = reader.uint8();
            const cooldown = reader.float();

            this.cooldowns.set(doorId, cooldown);
        }

        for (let i = 0; i < MapDoors.Polus; i++) {
            this.doors[i] = reader.bool();
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.upacked(this.cooldowns.size);

        for (const [ doorId, cooldown ] of this.cooldowns) {
            writer.uint8(doorId);
            writer.float(cooldown);
        }

        for (let i = 0; i < MapDoors.Polus; i++) {
            writer.bool(this.doors[i]);
        }
    }
}