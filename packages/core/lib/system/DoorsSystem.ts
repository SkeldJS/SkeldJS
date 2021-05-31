import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { Door, DoorEvents } from "../misc/Door";
import { SystemStatusEvents } from "./events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { DoorsDoorCloseEvent, DoorsDoorOpenEvent } from "../events";

export interface DoorsSystemData {
    cooldowns: Map<number, number>;
    doors: boolean[];
}

export type DoorsSystemEvents = SystemStatusEvents &
    DoorEvents &
    ExtractEventTypes<[]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link DoorsSystemEvents} for events to listen to.
 */
export class DoorsSystem extends SystemStatus<
    DoorsSystemData,
    DoorsSystemEvents
> {
    static systemType = SystemType.Doors as const;
    systemType = SystemType.Doors as const;

    /**
     * The cooldowns of every door.
     */
    cooldowns: Map<number, number>;

    /**
     * The doors in the map.
     */
    doors: Door[];

    constructor(ship: InnerShipStatus, data?: HazelReader | DoorsSystemData) {
        super(ship, data);

        this.cooldowns ||= new Map;
        this.doors ||= [];

        this.doors = this.doors.map((door, i) =>
            typeof door === "boolean"
                ? new Door(this, i, door)
                : door);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const num_cooldown = reader.upacked();

        for (let i = 0; i < num_cooldown; i++) {
            const doorId = reader.uint8();
            const cooldown = reader.float();

            this.cooldowns.set(doorId, cooldown);
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

        for (const [doorId, cooldown] of this.cooldowns) {
            writer.uint8(doorId);
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

    async openDoor(doorId: number) {
        if (!this.room.me)
            return;

        if (this.room.amhost) {
            await this._openDoor(doorId, this.room.me, undefined);
        } else {
            await this._repairSystem(doorId);
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

    async closeDoor(doorId: number) {
        if (!this.room.me)
            return;

        this._closeDoor(doorId, this.room.me, undefined);
    }

    async HandleRepair(player: PlayerData, amount: number, rpc: RepairSystemMessage|undefined) {
        const doorId = amount & 0x1f;

        await this._openDoor(doorId, player, rpc);
    }
}
