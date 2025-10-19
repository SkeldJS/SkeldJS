import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage, DoorCooldownDataMessage, DoorsSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { BasicEvent, EventEmitter, ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { SystemStatusEvents } from "./events";
import { DoorsDoorCloseEvent, DoorsDoorOpenEvent } from "../events";
import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export type DoorEvents<RoomType extends StatefulRoom> = ExtractEventTypes<
    [DoorsDoorOpenEvent<RoomType>, DoorsDoorCloseEvent<RoomType>]
>;

/**
 * Represents a manual door for the {@link DoorsSystem} or {@link ElectricalDoorsSystem}.
 *
 * See {@link DoorEvents} for events to listen to.
 */
export class Door<RoomType extends StatefulRoom> extends EventEmitter<DoorEvents<RoomType>> {
    isOpen: boolean;

    constructor(
        protected system: SystemStatus<RoomType>,
        readonly doorId: number,
        isOpen: boolean
    ) {
        super();

        this.isOpen = isOpen;
    }

    async emit<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.system) {
            await this.system.emit(event);
        }

        return super.emit(event);
    }

    async emitSerial<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.system) {
            await this.system.emitSerial(event);
        }

        return super.emitSerial(event);
    }

    emitSync<Event extends BasicEvent>(event: Event): Event {
        if (this.system) {
            this.system.emitSync(event);
        }

        return super.emitSync(event);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deserializeFromReader(reader: HazelReader, spawn: boolean) {
        this.isOpen = reader.bool(); // Use setter to emit events.
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serializeToWriter(writer: HazelWriter, spawn: boolean) {
        writer.bool(this.isOpen);
    }
}

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

    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return DoorsSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof DoorsSystemDataMessage) {
            for (const systemCooldown of data.cooldowns) {
                this.cooldowns.set(systemCooldown.systemType, systemCooldown.cooldown);
            }
            for (let i = 0; i < data.doorStates.length; i++) {
                const doorState = data.doorStates[i];
                if (doorState) {
                    await this._openDoor(i, undefined, undefined);
                } else {
                    await this._closeDoor(i, undefined, undefined);
                }
            }
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            const message = new DoorsSystemDataMessage([], []);
            for (const [ systemType, cooldown ] of this.cooldowns) {
                message.cooldowns.push(new DoorCooldownDataMessage(systemType, cooldown));
            }
            message.doorStates.push(...this.doors.map(door => door.isOpen));
            return message;
        }
        return undefined;
    }

    private async _openDoor(doorId: number, player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        const door = this.doors[doorId];

        if (!door)
            return;

        door.isOpen = true;
        this.pushDataUpdate();

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
        this.pushDataUpdate();

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
                this.pushDataUpdate();
                continue;
            }

            this.cooldowns.set(systemType, newTime);

            if (this.lastUpdate > 1) {
                this.pushDataUpdate();
                this.lastUpdate = 0;
            }
        }
    }
}
