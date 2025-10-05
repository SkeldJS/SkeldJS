import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { Door, DoorEvents } from "../misc/Door";
import { SystemStatusEvents } from "./events";
import { DoorsDoorCloseEvent, DoorsDoorOpenEvent } from "../events";
import { StatefulRoom } from "../StatefulRoom";

export type ElectricalDoorsSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> &
    DoorEvents<RoomType> &
    ExtractEventTypes<[]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link ElectricalDoorsSystemEvents} for events to listen to.
 */
export class ElectricalDoorsSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, ElectricalDoorsSystemEvents<RoomType>> {
    /**
     * The doors in the map.
     */
    doors: Door<RoomType>[] = [];

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    deserializeFromReader(reader: HazelReader, spawn: boolean) {
        const bitfield = reader.uint32();
        for (let i = 0; i < this.doors.length; i++) {
            const isOpen = (bitfield & (1 << i)) > 0;
            if (isOpen) {
                this._openDoor(i, undefined, undefined);
            } else {
                this._closeDoor(i, undefined, undefined);
            }
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    serializeToWriter(writer: HazelWriter, spawn: boolean) {
        let bitfield = 0;
        for (let i = 0; i < this.doors.length; i++) {
            bitfield |= ((this.doors[i].isOpen as unknown) as number) << i;
        }
        writer.uint32(bitfield);
        this.dirty = spawn;
    }

    private async _openDoor(doorId: number, player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
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
    async openDoorPlayer(doorId: number, openedByPlayer: Player<RoomType>) {
        await this._openDoor(doorId, openedByPlayer, undefined);
    }

    async openDoorHost(doorId: number) {
        await this._openDoor(doorId, undefined, undefined);
    }

    private async _closeDoor(doorId: number, player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
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
    async closeDoorPlayer(doorId: number, closedByPlayer: Player<RoomType>) {
        await this._closeDoor(doorId, closedByPlayer, undefined);
    }

    async closeDoorHost(doorId: number) {
        await this._closeDoor(doorId, undefined, undefined);
    }
    
    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined): Promise<void> {
        void player, amount, rpc;
    }

    async handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined): Promise<void> {
        void player, rpc;
    }

    async fullyRepairHost(): Promise<void> {
        void 0;
    }

    async fullyRepairPlayer(player: Player<RoomType> | undefined): Promise<void> {
        void player;
    }

    async sendFullRepair(player: Player<RoomType>): Promise<void> {
        void player;
    }

    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }
}
