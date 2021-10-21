import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import { Door, DoorEvents } from "../misc/Door";
import { SystemStatusEvents } from "./events";
import { DoorsDoorCloseEvent, DoorsDoorOpenEvent } from "../events";
import { Hostable } from "../Hostable";

export interface ElectricalDoorsSystemData {
    doors: boolean[];
}

export type ElectricalDoorsSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents &
    DoorEvents<RoomType> &
    ExtractEventTypes<[]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link ElectricalDoorsSystemEvents} for events to listen to.
 */
export class ElectricalDoorsSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    ElectricalDoorsSystemData,
    ElectricalDoorsSystemEvents,
    RoomType
> {
    /**
     * The doors in the map.
     */
    doors!: Door<RoomType>[];

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | ElectricalDoorsSystemData
    ) {
        super(ship, systemType, data);

        this.doors ||= [];

        this.doors = this.doors.map((door, i) =>
            typeof door === "boolean"
                ? new Door(this, i, door)
                : door);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const dirtyBit = reader.uint32();
        for (let i = 0; i < this.doors.length; i++) {
            const isOpen = (dirtyBit & (1 << i)) > 0;
            console.log(isOpen);
            if (isOpen) {
                this._openDoor(i, undefined, undefined);
            } else {
                this._closeDoor(i, undefined, undefined);
            }
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

    private async _openDoor(doorId: number, player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        const door = this.doors[doorId];

        if (!door)
            return;

        door.isOpen = true;
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
     * @param doorId the ID of the door to open
     */
    async openDoor(doorId: number) {
        await this._openDoor(doorId, this.room.myPlayer, undefined);
    }

    private async _closeDoor(doorId: number, player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        const door = this.doors[doorId];

        if (!door)
            return;

        door.isOpen = false;
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
}
