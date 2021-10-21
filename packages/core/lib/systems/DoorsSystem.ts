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

export interface DoorsSystemData {
    cooldowns: Map<number, number>;
    doors: boolean[];
}

export type DoorsSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents &
    DoorEvents<RoomType> &
    ExtractEventTypes<[]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link DoorsSystemEvents} for events to listen to.
 */
export class DoorsSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    DoorsSystemData,
    DoorsSystemEvents,
    RoomType
> {
    /**
     * The cooldowns of every door.
     */
    cooldowns: Map<number, number>;

    /**
     * The doors in the map.
     */
    doors: Door<RoomType>[];

    private lastUpdate: number;

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | DoorsSystemData
    ) {
        super(ship, systemType, data);

        this.cooldowns ||= new Map;
        this.doors ||= [];

        this.doors = this.doors.map((door, i) =>
            typeof door === "boolean"
                ? new Door(this, i, door)
                : door);

        this.lastUpdate = 0;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const numCooldown = reader.upacked();

        for (let i = 0; i < numCooldown; i++) {
            const systemType = reader.uint8();
            const cooldown = reader.float();

            this.cooldowns.set(systemType, cooldown);
        }

        for (const door of this.doors) {
            door.Deserialize(reader, false);
            if (door.isOpen) {
                this._openDoor(door.id, undefined, undefined);
            } else {
                this._closeDoor(door.id, undefined, undefined);
            }
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.upacked(this.cooldowns.size);

        for (const [systemType, cooldown] of this.cooldowns) {
            writer.uint8(systemType);
            writer.float(cooldown);
        }

        for (const door of this.doors) {
            writer.bool(door.isOpen);
        }
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
     * Open a door by its ID.
     * @param doorId The ID of the door to opne.
     */
    async openDoor(doorId: number) {
        if (this.room.hostIsMe) {
            await this._openDoor(doorId, this.room.myPlayer, undefined);
        } else {
            await this._sendRepair(doorId);
        }
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
     * Close a door by its ID.
     * @param doorId The ID of the door to close.
     */
    async closeDoor(doorId: number) {
        this._closeDoor(doorId, this.room.myPlayer, undefined);
    }

    async HandleRepair(player: PlayerData|undefined, amount: number, rpc: RepairSystemMessage|undefined) {
        const doorId = amount & 0x1f;

        await this._openDoor(doorId, player, rpc);
    }

    Detoriorate(delta: number) {
        this.lastUpdate += delta;
        for (const [ systemType, prevTime ] of this.cooldowns) {
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
