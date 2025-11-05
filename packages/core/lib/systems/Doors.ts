import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage, CastVoteMessage, DoorCooldownDataMessage, DoorsSystemDataMessage, DoorsSystemMessage, DoorUpdate, RepairSystemMessage } from "@skeldjs/au-protocol";
import { BasicEvent, EventEmitter, EventMapFromList } from "@skeldjs/events";
import { RootMessageTag, SystemType } from "@skeldjs/au-constants";

import { System } from "./System";
import { Player } from "../Player";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { DoorsSystemCloseDoorEvent, DoorsSystemOpenDoorEvent, DoorsSystemZoneReadyToCloseEvent } from "../events";

export type DoorEvents<RoomType extends StatefulRoom> = EventMapFromList<[]>;

export abstract class Door<RoomType extends StatefulRoom> {
    isOpen: boolean = true;

    constructor(
        public readonly doorSystem: System<RoomType>,
        public readonly zone: SystemType,
        public readonly doorId: number,
    ) {}

    pushDataUpdate() {
        this.doorSystem.pushDataUpdate();
    }
}

export class ManualDoor<RoomType extends StatefulRoom> extends Door<RoomType> {
    declare doorSystem: DoorsSystem<RoomType>

    async closeZoneWithAuth() {
        await this.doorSystem.closeZoneWithAuth(this.zone);
    }

    async closeZoneRequest() {
        await this.doorSystem.closeZoneRequest(this.zone);
    }

    async closeZone() {
        if (this.doorSystem.room.canManageObject(this.doorSystem.shipStatus)) {
            await this.closeZoneWithAuth();
        } else {
            await this.closeZoneRequest();
        }
    }

    async setZoneCooldownWithAuth(cooldown: number) {
        await this.doorSystem.setZoneCooldownWithAuth(this.zone, cooldown);
    }
}

export type DoorsSystemEvents<RoomType extends StatefulRoom> = DoorEvents<RoomType> & EventMapFromList<[
    DoorsSystemCloseDoorEvent<RoomType>,
    DoorsSystemOpenDoorEvent<RoomType>,
    DoorsSystemZoneReadyToCloseEvent<RoomType>,
]>;

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

    doors: ManualDoor<RoomType>[] = [];

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
                const previousCooldown = this.zoneCooldowns.get(systemCooldown.systemType);
                this.zoneCooldowns.set(systemCooldown.systemType, systemCooldown.cooldown);
                if ((!previousCooldown || previousCooldown > 0) && systemCooldown.cooldown <= 0) {
                    await this._zoneReadyToClose(systemCooldown.systemType, data);
                }
            }
            for (let i = 0; i < data.doorStates.length; i++) {
                const isOpen = data.doorStates[i];
                const door = this.doors[i];
                if (!door) continue; // TODO: throw exception?
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
                }
            }
            message.doorStates.push(...this.doors.map(door => door.isOpen));
            return message;
        }
        return undefined;
    }
    
    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return DoorsSystemMessage.deserializeFromReader(reader);
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof DoorsSystemMessage) {
            switch (message.update) {
            case DoorUpdate.Open:
                const door = this.shipStatus.getDoorById(message.doorId);
                if (door) {
                    // Among Us handles ALL doors being opened through the DoorsSystem - even the AutoCloseDoor toilets
                    // on Airship. This is annoying, we have to chase the systems that manage each door around.
                    await this.shipStatus.openDoorWithAuth(door);
                } else {
                    // TODO: throw exception?
                }
                break;
            }
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        if (this.initialCooldown > 0) {
            this.initialCooldown = Math.max(this.initialCooldown - deltaSeconds, 0);
        }

        for (const [ systemType, timer ] of this.zoneCooldowns) {
            if (timer > 0) {
                this.zoneCooldowns.set(systemType, Math.max(timer - deltaSeconds, 0));
                // TODO: event: door ready to be closed
            }
        }
    }
    
    protected async _closeDoorWithAuth(door: ManualDoor<RoomType>, originMessage: DoorsSystemDataMessage|null) {
        door.isOpen = false;
        const ev = await this.emit(new DoorsSystemCloseDoorEvent(this, originMessage, door));
        if (ev.reverted) {
            if (originMessage === null) {
                door.isOpen = true;
            } else {
                await this.openDoor(door);
            }
        }
        this.pushDataUpdate();
    }

    async closeDoorWithAuth(door: ManualDoor<RoomType>) {
        await this._closeDoorWithAuth(door, null);
    }

    protected async _openDoorWithAuth(door: ManualDoor<RoomType>, originMessage: DoorsSystemDataMessage|null) {
        door.isOpen = true;
        const ev = await this.emit(new DoorsSystemOpenDoorEvent(this, originMessage, door));
        if (ev.reverted) {
            if (originMessage === null) {
                door.isOpen = false;
            } else {
                await this.closeDoorWithAuth(door);
            }
        }
        this.pushDataUpdate();
    }
    
    async openDoorWithAuth(door: ManualDoor<RoomType>) {
        await this._openDoorWithAuth(door, null);
    }

    async openDoorRequest(door: ManualDoor<RoomType>) {
        await this.sendUpdateSystem(new DoorsSystemMessage(DoorUpdate.Open, door.doorId));
    }

    async openDoor(door: ManualDoor<RoomType>) {
        if (this.room.canManageObject(this.shipStatus)) {
            await this.openDoorWithAuth(door);
        } else {
            await this.openDoorRequest(door);
        }
    }

    protected async _zoneReadyToClose(zone: SystemType, originMessage: DoorsSystemDataMessage|null) {
        const ev = await this.emit(
            new DoorsSystemZoneReadyToCloseEvent(
                this,
                originMessage,
                zone,
            )
        );

        if (ev.reverted) {
            this.zoneCooldowns.set(zone, DoorsSystem.maxZoneCooldown);
            this.pushDataUpdate();
        }
    }

    async closeZoneWithAuth(zone: SystemType) {
        for (const door of this.doors) {
            if (door.zone === zone) {
                await this.closeDoorWithAuth(door);
            }
        }
        this.zoneCooldowns.set(zone, DoorsSystem.maxZoneCooldown);
        this.pushDataUpdate();
    }

    async closeZoneRequest(zone: SystemType) {
        await this.shipStatus.closeDoorsInZoneRequest(zone);
    }

    async closeZone(zone: SystemType) {
        if (this.room.canManageObject(this.shipStatus)) {
            await this.closeZoneWithAuth(zone);
        } else {
            await this.closeZoneRequest(zone);
        }
    }

    getDoorById(doorId: number) {
        return this.doors.find(door => door.doorId === doorId);
    }

    getZoneCooldown(zone: SystemType) {
        if (this.initialCooldown > 0) {
            return this.initialCooldown;
        }
        const cooldown = this.zoneCooldowns.get(zone);
        return cooldown || 0;
    }

    async setZoneCooldownWithAuth(zone: SystemType, cooldown: number) {
        this.zoneCooldowns.set(zone, cooldown);
        this.pushDataUpdate();
    }
}
