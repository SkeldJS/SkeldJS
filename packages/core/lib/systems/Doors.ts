import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage, DoorCooldownDataMessage, DoorsSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { BasicEvent, EventEmitter, ExtractEventTypes } from "@skeldjs/events";

import { System } from "./System";
import { Player } from "../Player";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { SystemType } from "@skeldjs/constant";

export type DoorEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a manual door for the {@link DoorsSystem} or {@link ElectricalDoorsSystem}.
 *
 * See {@link DoorEvents} for events to listen to.
 */
export class Door<RoomType extends StatefulRoom> extends EventEmitter<DoorEvents<RoomType>> {
    isOpen: boolean = true;

    constructor(
        public readonly doorSystem: System<RoomType>,
        public readonly associatedZone: SystemType,
        public readonly doorId: number,
    ) {
        super();
    }

    pushDataUpdate() {
        this.doorSystem.pushDataUpdate();
    }

    async emit<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.doorSystem) {
            await this.doorSystem.emit(event);
        }

        return super.emit(event);
    }

    async emitSerial<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.doorSystem) {
            await this.doorSystem.emitSerial(event);
        }

        return super.emitSerial(event);
    }

    emitSync<Event extends BasicEvent>(event: Event): Event {
        if (this.doorSystem) {
            this.doorSystem.emitSync(event);
        }

        return super.emitSync(event);
    }

    async openWithAuth() {
        this.isOpen = true;
        this.pushDataUpdate();
        // TODO: event: open door
    }

    async closeWithAuth() {
        this.isOpen = false;
        this.pushDataUpdate();
        // TODO: event: close door
    }
}

export type DoorsSystemEvents<RoomType extends StatefulRoom> = DoorEvents<RoomType> & ExtractEventTypes<[]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link DoorsSystemEvents} for events to listen to.
 */
export class DoorsSystem<RoomType extends StatefulRoom> extends System<RoomType, DoorsSystemEvents<RoomType>> {
    static maxZoneCooldown = 30;
    static initialCooldown = 10;

    initialCooldown: number = DoorsSystem.initialCooldown;
    zoneCooldowns: Map<SystemType, number> = new Map;

    doors: Door<RoomType>[] = [];

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return DoorsSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof DoorsSystemDataMessage) {
            for (const systemCooldown of data.cooldowns) {
                this.zoneCooldowns.set(systemCooldown.systemType, systemCooldown.cooldown);
            }
            for (let i = 0; i < data.doorStates.length; i++) {
                const isOpen = data.doorStates[i];
                const door = this.doors[i];
                if (!door) continue; // TODO: throw exception
                door.isOpen = isOpen;
            }
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            const message = new DoorsSystemDataMessage([], []);
            for (const [ systemType, timer ] of this.zoneCooldowns) {
                if (timer > 0) {
                    message.cooldowns.push(new DoorCooldownDataMessage(systemType, timer));
                    // TODO: event: door ready to close
                }
            }
            message.doorStates.push(...this.doors.map(door => door.isOpen));
            return message;
        }
        return undefined;
    }
    
    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return undefined;
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        void player, message;
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        if (this.initialCooldown > 0) {
            this.initialCooldown = Math.max(this.initialCooldown - deltaSeconds, 0);
        }

        for (const [ systemType, timer ] of this.zoneCooldowns) {
            if (timer > 0) {
                this.zoneCooldowns.set(systemType, Math.max(timer - deltaSeconds, 0));
                // TODO: event: door ready to close
            }
        }
    }

    async closeDoorsWithAuth(systemType: SystemType) {
        for (const door of this.doors) {
            if (door.associatedZone === systemType) {
                await door.closeWithAuth();
            }
        }
        this.zoneCooldowns.set(systemType, DoorsSystem.maxZoneCooldown);
        this.pushDataUpdate();
    }

    getZoneCooldown(systemType: SystemType) {
        if (this.initialCooldown > 0) {
            return this.initialCooldown;
        }
        const cooldown = this.zoneCooldowns.get(systemType);
        return cooldown || 0;
    }
}
