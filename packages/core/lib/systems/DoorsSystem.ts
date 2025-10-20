import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage, DoorCooldownDataMessage, DoorsSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { BasicEvent, EventEmitter, ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export type DoorEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

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

export type DoorsSystemEvents<RoomType extends StatefulRoom> = DoorEvents<RoomType> & ExtractEventTypes<[]>;

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
                    this.doors[i].isOpen = true;
                } else {
                    this.doors[i].isOpen = false;
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
}
