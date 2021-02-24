import { HazelBuffer } from "@skeldjs/util"

import {
    SystemType,
    MapID
} from "@skeldjs/constant";

import {
    MapDoors
} from "@skeldjs/data"

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { Door, DoorEvents } from "../misc/Door";
import { PropagatedEvents } from "../util/PropagatedEvents";

export interface DoorsSystemData {
    cooldowns: Map<number, number>;
    doors: boolean[];
}

export type DoorsSystemEvents = PropagatedEvents<DoorEvents, { system: DoorsSystem }> & {

}

export class DoorsSystem extends SystemStatus<DoorsSystemEvents> {
    static systemType = SystemType.Doors as const;
    systemType = SystemType.Doors as const;

    cooldowns: Map<number, number>;
    doors: Door[];

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

        for (let i = 0; i < MapDoors[MapID.Polus]; i++) {
            this.doors[i].isOpen = reader.bool();
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.upacked(this.cooldowns.size);

        for (const [ doorId, cooldown ] of this.cooldowns) {
            writer.uint8(doorId);
            writer.float(cooldown);
        }

        for (let i = 0; i < MapDoors[MapID.Polus]; i++) {
            this.doors[i].Serialize(writer, spawn);
        }
    }

    HandleRepair(player: PlayerData, amount: number) {
        const doorId = amount & 0x1f;

        this.doors[doorId].open();
    }
}
