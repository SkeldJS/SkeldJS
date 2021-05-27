import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { Door, DoorEvents } from "../misc/Door";
import { SystemStatusEvents } from "./events";

export interface DoorsSystemData {
    cooldowns: Map<number, number>;
    doors: boolean[];
}

export type DoorsSystemEvents = SystemStatusEvents &
    DoorEvents &
    ExtractEventTypes<[]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link DoorsSystemEvents} for events to listen to.
 */
export class DoorsSystem extends SystemStatus<
    DoorsSystemData,
    DoorsSystemEvents
> {
    static systemType = SystemType.Doors as const;
    systemType = SystemType.Doors as const;

    /**
     * The cooldowns of every door.
     */
    cooldowns: Map<number, number>;

    /**
     * The doors in the map.
     */
    doors: Door[];

    constructor(ship: InnerShipStatus, data?: HazelReader | DoorsSystemData) {
        super(ship, data);

        this.cooldowns ||= new Map;
        this.doors ||= [];

        this.doors = this.doors.map((door, i) =>
            typeof door === "boolean"
                ? new Door(this, i, door)
                : door);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const num_cooldown = reader.upacked();

        for (let i = 0; i < num_cooldown; i++) {
            const doorId = reader.uint8();
            const cooldown = reader.float();

            this.cooldowns.set(doorId, cooldown);
        }

        for (let i = 0; i < this.doors.length; i++) {
            this.doors[i].isOpen = reader.bool();
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.upacked(this.cooldowns.size);

        for (const [doorId, cooldown] of this.cooldowns) {
            writer.uint8(doorId);
            writer.float(cooldown);
        }

        for (let i = 0; i < this.doors.length; i++) {
            this.doors[i].Serialize(writer, spawn);
        }
    }

    HandleRepair(player: PlayerData, amount: number) {
        const doorId = amount & 0x1f;

        this.doors[doorId].open();
    }
}
