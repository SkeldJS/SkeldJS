import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType, GameMap } from "@skeldjs/constant";
import { MapDoors } from "@skeldjs/data";
import { ExtractEventTypes } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { AutoOpenDoor } from "../misc/AutoOpenDoor";
import { DoorEvents } from "../misc/Door";
import { SystemStatusEvents } from "./events";
import { PlayerData } from "../PlayerData";
import { DoorsDoorCloseEvent, DoorsDoorOpenEvent } from "../events";

export interface AutoDoorsSystemData {
    dirtyBit: number;
    doors: boolean[];
}

export type AutoDoorsSystemEvents = SystemStatusEvents &
    DoorEvents &
    ExtractEventTypes<[]>;

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

        this.dirtyBit ||= 0;
        this.doors ||= [];

        this.doors = this.doors.map((door, i) =>
            typeof door === "boolean"
                ? new AutoOpenDoor(this, i, door)
                : door);
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

    async closeDoor(doorId: number) {
        if (!this.room.me)
            return;

        await this._closeDoor(doorId, this.room.me, undefined);
    }

    Detoriorate(delta: number) {
        for (const door of this.doors) {
            if (!door.isOpen && door.DoUpdate(delta)) {
                this.dirty = true;
            }
        }
    }
}
