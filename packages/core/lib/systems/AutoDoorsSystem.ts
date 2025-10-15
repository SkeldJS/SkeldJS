import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { SystemStatusEvents } from "./events";
import { DoorsDoorCloseEvent, DoorsDoorOpenEvent } from "../events";
import { StatefulRoom } from "../StatefulRoom";
import { Door, DoorEvents } from "./DoorsSystem";

/**
 * Represents an auto opening door for the {@link AutoDoorsSystem}.
 *
 * See {@link DoorEvents} for events to listen to.
 */
export class AutoOpenDoor<RoomType extends StatefulRoom> extends Door<RoomType> {
    timer: number;

    constructor(
        protected system: AutoDoorsSystem<RoomType>,
        readonly doorId: number,
        isOpen: boolean
    ) {
        super(system, doorId, isOpen);

        this.timer = 0;
    }

    DoUpdate(delta: number) {
        this.timer -= delta;

        if (this.timer < 0) {
            this.system.openDoorHost(this.doorId);
            return true;
        }
        return false;
    }
}

export type AutoDoorsSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> &
    DoorEvents<RoomType> &
    ExtractEventTypes<[]>;

/**
 * Represents a system for doors that open after a period of time.
 *
 * See {@link AutoDoorsSystemEvents} for events to listen to.
 */
export class AutoDoorsSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, AutoDoorsSystemEvents<RoomType>> {
    /**
     * The dirty doors to be updated on the next fixed update.
     */
    dirtyBit: number = 0;

    /**
     * The doors in the map.
     */
    doors: AutoOpenDoor<RoomType>[] = [];
    
    handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined): Promise<void> {
        throw new Error("Method not implemented.");
    }
    handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined): Promise<void> {
        throw new Error("Method not implemented.");
    }

    deserializeFromReader(reader: HazelReader, spawn: boolean) {
        if (spawn) {
            for (let i = 0; i < this.doors.length; i++) {
                const open = reader.bool();
                this.doors[i] = new AutoOpenDoor(this, i, open);
            }
        } else {
            const mask = reader.upacked();

            for (let i = 0; i < this.doors.length; i++) {
                if (mask & (1 << i)) {
                    const isOpen = reader.bool();
                    if (isOpen) {
                        this._openDoor(i, undefined, undefined);
                    } else {
                        this._closeDoor(i, undefined, undefined);
                    }
                }
            }
        }
    }

    serializeToWriter(writer: HazelWriter, spawn: boolean) {
        if (spawn) {
            for (let i = 0; i < this.doors.length; i++) {
                this.doors[i].serializeToWriter(writer, spawn);
            }
        } else {
            writer.upacked(this.dirtyBit);

            for (let i = 0; i < this.doors.length; i++) {
                if (this.dirtyBit & (1 << i)) {
                    this.doors[i].serializeToWriter(writer, spawn);
                }
            }
        }
        this.dirtyBit = 0;
    }

    private async _openDoor(doorId: number, player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
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
    async closeDoorPlayer(doorId: number, closedByPlayer: Player<RoomType>) {
        await this._closeDoor(doorId, closedByPlayer, undefined);
    }

    async closeDoorHost(doorId: number) {
        await this._closeDoor(doorId, undefined, undefined);
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
        for (const door of this.doors) {
            if (!door.isOpen && door.DoUpdate(delta)) {
                this.dirty = true;
            }
        }
    }
}
