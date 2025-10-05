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

export type DoorsSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> &
    DoorEvents<RoomType> &
    ExtractEventTypes<[]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link DoorsSystemEvents} for events to listen to.
 */
export class DoorsSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, DoorsSystemEvents<RoomType>> {
    /**
     * The cooldowns of every door.
     */
    cooldowns: Map<number, number> = new Map;

    /**
     * The doors in the map.
     */
    doors: Door<RoomType>[] = [];

    private lastUpdate: number = 0;

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    deserializeFromReader(reader: HazelReader, spawn: boolean) {
        const numCooldown = reader.upacked();

        for (let i = 0; i < numCooldown; i++) {
            const systemType = reader.uint8();
            const cooldown = reader.float();

            this.cooldowns.set(systemType, cooldown);
        }

        for (const door of this.doors) {
            door.deserializeFromReader(reader, false);
            if (door.isOpen) {
                this._openDoor(door.doorId, undefined, undefined);
            } else {
                this._closeDoor(door.doorId, undefined, undefined);
            }
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    serializeToWriter(writer: HazelWriter, spawn: boolean) {
        writer.upacked(this.cooldowns.size);

        for (const [systemType, cooldown] of this.cooldowns) {
            writer.uint8(systemType);
            writer.float(cooldown);
        }

        for (const door of this.doors) {
            writer.bool(door.isOpen);
        }
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
     * Open a door by its ID.
     * @param doorId The ID of the door to opne.
     */
    async openDoorPlayer(doorId: number, openedByPlayer: Player<RoomType>) {
        await this._openDoor(doorId, openedByPlayer, undefined);
    }

    async openDoorHost(doorId: number) {
        await this._openDoor(doorId, undefined, undefined);
    }

    async openDoor(doorId: number) {
        await this._sendRepair(doorId);
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
     * Close a door by its ID.
     * @param doorId The ID of the door to close.
     */
    async closeDoorPlayer(doorId: number, closedByPlayer: Player<RoomType>) {
        this._closeDoor(doorId, closedByPlayer, undefined);
    }

    async closeDoorHost(doorId: number) {
        await this._closeDoor(doorId, undefined, undefined);
    }
    
    handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined) {
        const doorId = amount & 0x1f;

        await this._openDoor(doorId, player, rpc);
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

    async processFixedUpdate(delta: number) {
        this.lastUpdate += delta;
        for (const [systemType, prevTime] of this.cooldowns) {
            const newTime = prevTime - delta;
            if (newTime < 0) {
                this.cooldowns.delete(systemType);
                this.lastUpdate = 0;
                this.dirty = true;
                continue;
            }

            this.cooldowns.set(systemType, newTime);

            if (this.lastUpdate > 1) {
                this.dirty = true;
                this.lastUpdate = 0;
            }
        }
    }
}
