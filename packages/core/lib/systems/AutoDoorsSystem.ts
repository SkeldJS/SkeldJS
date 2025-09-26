import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { AutoOpenDoor } from "../misc/AutoOpenDoor";
import { DoorEvents } from "../misc/Door";
import { SystemStatusEvents } from "./events";
import { DoorsDoorCloseEvent, DoorsDoorOpenEvent } from "../events";
import { StatefulRoom } from "../StatefulRoom";

export interface AutoDoorsSystemData {
    dirtyBit: number;
    doors: boolean[];
}

export type AutoDoorsSystemEvents<RoomType extends StatefulRoom = StatefulRoom> = SystemStatusEvents &
    DoorEvents<RoomType> &
    ExtractEventTypes<[]>;

/**
 * Represents a system for doors that open after a period of time.
 *
 * See {@link AutoDoorsSystemEvents} for events to listen to.
 */
export class AutoDoorsSystem<RoomType extends StatefulRoom = StatefulRoom> extends SystemStatus<
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

    private async _openDoor(doorId: number, player: Player | undefined, rpc: RepairSystemMessage | undefined) {
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
    async openDoorPlayer(doorId: number, openedByPlayer: Player) {
        await this._openDoor(doorId, openedByPlayer, undefined);
    }

    async openDoorHost(doorId: number) {
        await this._openDoor(doorId, undefined, undefined);
    }

    private async _closeDoor(doorId: number, player: Player | undefined, rpc: RepairSystemMessage | undefined) {
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
    async closeDoorPlayer(doorId: number, closedByPlayer: Player) {
        await this._closeDoor(doorId, closedByPlayer, undefined);
    }

    async closeDoorHost(doorId: number) {
        await this._closeDoor(doorId, undefined, undefined);
    }

    Detoriorate(delta: number) {
        for (const door of this.doors) {
            if (!door.isOpen && door.DoUpdate(delta)) {
                this.dirty = true;
            }
        }
    }
}
