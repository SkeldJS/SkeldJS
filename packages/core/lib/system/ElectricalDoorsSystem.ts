import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { Door, DoorEvents } from "../misc/Door";
import { SystemStatusEvents } from "./events";
import { ExtractEventTypes } from "@skeldjs/events";

export interface ElectricalDoorsSystemData {
    cooldowns: Map<number, number>;
    doors: boolean[];
}

export type ElectricalDoorsSystemEvents = SystemStatusEvents &
    DoorEvents &
    ExtractEventTypes<[]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link ElectricalDoorsSystemEvents} for events to listen to.
 */
export class ElectricalDoorsSystem extends SystemStatus<
    ElectricalDoorsSystemData,
    ElectricalDoorsSystemEvents
> {
    static systemType = SystemType.Decontamination as const;
    systemType = SystemType.Decontamination as const;

    /**
     * The doors in the map.
     */
    doors: Door[];

    constructor(
        ship: InnerShipStatus,
        data?: HazelReader | ElectricalDoorsSystemData
    ) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const dirtyBit = reader.uint32();
        for (let i = 0; i < this.doors.length; i++) {
            this.doors[i].isOpen = (dirtyBit & (1 << i)) > 0;
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        let dirtyBit = 0;
        for (let i = 0; i < this.doors.length; i++) {
            dirtyBit |= ((this.doors[i].isOpen as unknown) as number) << i;
        }
        writer.uint32(dirtyBit);
        this.dirty = spawn;
    }
}
