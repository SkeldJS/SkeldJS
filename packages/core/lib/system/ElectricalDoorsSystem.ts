import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { Door, DoorEvents } from "../misc/Door";
import { SystemStatusEvents } from "./events";
import { ExtractEventTypes } from "@skeldjs/events";
import { PlayerData } from "../PlayerData";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { DoorsDoorCloseEvent, DoorsDoorOpenEvent } from "../events";

export interface ElectricalDoorsSystemData {
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
    doors!: Door[];

    constructor(
        ship: InnerShipStatus,
        data?: HazelReader | ElectricalDoorsSystemData
    ) {
        super(ship, data);

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

    async openDoor(doorId: number) {
        if (!this.room.me)
            return;

        await this._openDoor(doorId, this.room.me, undefined);
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

    async closeDoor(doorId: number) {
        if (!this.room.me)
            return;

        this._closeDoor(doorId, this.room.me, undefined);
    }

    async HandleRepair(player: PlayerData, amount: number, rpc: RepairSystemMessage) {
        const doorId = amount & 0x1f;

        await this._openDoor(doorId, player, rpc);
    }
}
