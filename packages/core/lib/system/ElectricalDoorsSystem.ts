import { HazelBuffer } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { Door, DoorEvents } from "../misc/Door";
import { BaseSystemStatusEvents } from "./events";

export interface ElectricalDoorsSystemData {
    cooldowns: Map<number, number>;
    doors: boolean[];
}

export type BaseElectricalDoorsSystemEvents = BaseSystemStatusEvents &
    DoorEvents;

export interface ElectricalDoorsSystemEvents
    extends BaseElectricalDoorsSystemEvents {}

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
        data?: HazelBuffer | ElectricalDoorsSystemData
    ) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const dirtyBit = reader.uint32();
        for (let i = 0; i < this.doors.length; i++) {
            this.doors[i].isOpen = (dirtyBit & (1 << i)) > 0;
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        let dirtyBit = 0;
        for (let i = 0; i < this.doors.length; i++) {
            dirtyBit |= ((this.doors[i].isOpen as unknown) as number) << i;
        }
        writer.uint32(dirtyBit);
        this.dirty = spawn;
    }
}
