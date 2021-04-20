import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType, GameMap } from "@skeldjs/constant";
import { MapDoors } from "@skeldjs/data";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { AutoOpenDoor } from "../misc/AutoOpenDoor";
import { DoorEvents } from "../misc/Door";
import { BaseSystemStatusEvents } from "./events";

export interface AutoDoorsSystemData {
    dirtyBit: number;
    doors: boolean[];
}

type BaseAutoDoorsSystemEvents = BaseSystemStatusEvents & DoorEvents;

export interface AutoDoorsSystemEvents extends BaseAutoDoorsSystemEvents {}

/**
 * Represents a system for doors that open after a period of time.
 *
 * See {@link AutoDoorsSystemEvents} for events to listen to.
 */
export class AutoDoorsSystem extends SystemStatus<
    AutoDoorsSystemData,
    AutoDoorsSystemEvents
> {
    static systemType = SystemType.Doors as const;
    systemType = SystemType.Doors as const;

    /**
     * The dirty doors to be updated on the next fixed update.
     */
    dirtyBit: number;

    /**
     * The doors in the map.
     */
    doors: AutoOpenDoor[];

    constructor(
        ship: InnerShipStatus,
        data?: HazelReader | AutoDoorsSystemData
    ) {
        super(ship, data);
    }

    get dirty() {
        return this.dirtyBit > 0;
    }

    set dirty(val: boolean) {
        super.dirty = val;
    }

    Deserialize(reader: HazelReader, spawn: boolean) {
        if (spawn) {
            for (let i = 0; i < MapDoors[GameMap.TheSkeld]; i++) {
                const open = reader.bool();
                this.doors.push(new AutoOpenDoor(this, i, open));
            }
        } else {
            const mask = reader.upacked();

            for (let i = 0; i < MapDoors[GameMap.TheSkeld]; i++) {
                if (mask & (1 << i)) {
                    const door = this.doors[i];
                    const open = reader.bool();
                    door.isOpen = open;
                }
            }
        }
    }

    Serialize(writer: HazelWriter, spawn: boolean) {
        if (spawn) {
            for (let i = 0; i < this.doors.length; i++) {
                this.doors[i].Serialize(writer, spawn);
            }
        } else {
            writer.upacked(this.dirtyBit);

            for (let i = 0; i < this.doors.length; i++) {
                if (this.dirtyBit & (1 << i)) {
                    this.doors[i].Serialize(writer, spawn);
                }
            }
        }
    }
}
