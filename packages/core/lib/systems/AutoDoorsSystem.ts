import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import { AutoOpenDoor } from "../misc/AutoOpenDoor";
import { DoorEvents } from "../misc/Door";
import { SystemStatusEvents } from "./events";
import { DoorsDoorCloseEvent, DoorsDoorOpenEvent } from "../events";
import { Hostable } from "../Hostable";

export interface AutoDoorsSystemData {
    dirtyBit: number;
    doors: boolean[];
}

export type AutoDoorsSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents &
    DoorEvents<RoomType> &
    ExtractEventTypes<[]>;

/**
 * Represents a system for doors that open after a period of time.
 *
 * See {@link AutoDoorsSystemEvents} for events to listen to.
 */
export class AutoDoorsSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    AutoDoorsSystemData,
    AutoDoorsSystemEvents,
    RoomType
> {
    /**
     * The dirty doors to be updated on the next fixed update.
     */
    dirtyBit: number;

    /**
     * The doors in the map.
     */
    doors: AutoOpenDoor<RoomType>[];

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | AutoDoorsSystemData
    ) {
        super(ship, systemType, data);

        this.dirtyBit ||= 0;
        this.doors ||= [];

        this.doors = this.doors.map((door, i) =>
            typeof door === "boolean"
                ? new AutoOpenDoor(this, i, door)
                : door);
    }

    Deserialize(reader: HazelReader, spawn: boolean) {
        if (spawn) {
            for (let i = 0; i < this.doors.length; i++) {
                const open = reader.bool();
                this.doors.push(new AutoOpenDoor(this, i, open));
            }
        } else {
            const mask = reader.upacked();

            for (let i = 0; i < this.doors.length; i++) {
                if (mask & (1 << i)) {
                    const isOpen = reader.bool();
                    if (isOpen) {
                        this.openDoor(i);
                    } else {
                        this.closeDoor(i);
                    }
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
        this.dirtyBit = 0;
    }

    private async _openDoor(doorId: number, player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        const door = this.doors[doorId];

        if (!door)
            return;

        door.isOpen = true;
        this.dirtyBit |= 1 << doorId;
        this.dirty = true;

        const ev = await door.emit(
            new DoorsDoorOpenEvent(
                this.room,
                this,
                rpc,
                player,
                door
            )
        );

        if (ev.reverted) {
            door.isOpen = false;
            return;
        }

        if (ev.alteredDoor !== door) {
            door.isOpen = false;
            ev.alteredDoor.isOpen = true;
        }
    }

    /**
     * Open a door by its ID. This is a host operation on official servers.
     * @param doorId The ID of the door to open.
     */
    async openDoor(doorId: number) {
        await this._openDoor(doorId, this.room.myPlayer, undefined);
    }

    private async _closeDoor(doorId: number, player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        const door = this.doors[doorId];

        if (!door)
            return;

        door.isOpen = false;
        door.timer = 10;
        this.dirtyBit |= 1 << doorId;
        this.dirty = true;

        const ev = await door.emit(
            new DoorsDoorCloseEvent(
                this.room,
                this,
                rpc,
                player,
                door
            )
        );

        if (ev.reverted) {
            door.isOpen = true;
            return;
        }

        if (ev.alteredDoor !== door) {
            door.isOpen = true;
            ev.alteredDoor.isOpen = false;
        }
    }

    /**
     * Close a door by its ID. This is a host operation on official servers.
     * @param doorId The ID of the door to close.
     */
    async closeDoor(doorId: number) {
        await this._closeDoor(doorId, this.room.myPlayer, undefined);
    }

    Detoriorate(delta: number) {
        for (const door of this.doors) {
            if (!door.isOpen && door.DoUpdate(delta)) {
                this.dirty = true;
            }
        }
    }
}
