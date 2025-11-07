import { HazelReader } from "@skeldjs/hazel";
import { AutoDoorsSystemDataMessage, AutoDoorsSystemSpawnDataMessage, BaseSystemMessage, DoorStateDataMessage, RepairSystemMessage } from "@skeldjs/au-protocol";
import { EventMapFromList } from "@skeldjs/events";

import { System } from "./System";

import { StatefulRoom } from "../StatefulRoom";
import { Door, DoorEvents } from "./Doors";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";
import { RootMessageTag, SystemType } from "@skeldjs/au-constants";
import { AutoDoorsSystemCloseDoorEvent, AutoDoorsSystemOpenDoorEvent, AutoDoorsSystemDoorReadyToCloseEvent, DoorsSystemCloseDoorEvent } from "../events";

export abstract class AutoDoor<RoomType extends StatefulRoom> extends Door<RoomType> {
    declare doorSystem: AutoDoorsSystem<RoomType>;
    
    duration: number = 0;
    isDirty: boolean = false;

    pushDataUpdate() {
        this.isDirty = true;
        this.doorSystem.pushDataUpdate();
    }
    
    async processFixedUpdate(deltaSeconds: number) {
        this.duration -= deltaSeconds;

        if (this.duration < 0) {
            await this.durationEnd();
            this.duration = 0;
        }
    }

    protected abstract durationEnd(): Promise<void>;
    abstract setCloseDuration(): void;
    abstract setOpenDuration(): void;
}

/**
 * Represents an auto opening door for the {@link AutoDoorsSystem}.
 *
 * See {@link DoorEvents} for events to listen to.
 */
export class AutoOpenDoor<RoomType extends StatefulRoom> extends AutoDoor<RoomType> {
    cooldownTimer: number = 0;

    async processFixedUpdate(deltaSeconds: number) {
        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= deltaSeconds;
            if (this.cooldownTimer < 0) {
                this.cooldownTimer = 0;
                await this.doorSystem.emit(new AutoDoorsSystemDoorReadyToCloseEvent(this.doorSystem, this));
            }
        }

        if (!this.isOpen) {
            await super.processFixedUpdate(deltaSeconds);
        }
    }

    protected async durationEnd(): Promise<void> {
        await this.doorSystem.openDoorWithAuth(this);
    }

    setCloseDuration(): void {
        this.cooldownTimer = AutoDoorsSystem.doorTimer;
        this.duration = AutoDoorsSystem.closeDuration;
    }

    setOpenDuration(): void {
        this.duration = 0;
    }
    
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
}

/**
 * Represents an auto opening door for the {@link AutoDoorsSystem}.
 *
 * See {@link DoorEvents} for events to listen to.
 */
export class AutoCloseDoor<RoomType extends StatefulRoom> extends AutoDoor<RoomType> {
    async processFixedUpdate(deltaSeconds: number) {
        if (this.isOpen) {
            await super.processFixedUpdate(deltaSeconds);
        }
    }

    protected async durationEnd(): Promise<void> {
        await this.doorSystem.closeDoorWithAuth(this);
    }

    setCloseDuration(): void {
        this.duration = 0;
    }

    setOpenDuration(): void {
        this.duration = AutoDoorsSystem.openDuration;
    }

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
}

export type AutoDoorsSystemEvents<RoomType extends StatefulRoom> = DoorEvents<RoomType> & EventMapFromList<[
    AutoDoorsSystemOpenDoorEvent<RoomType>,
    AutoDoorsSystemCloseDoorEvent<RoomType>,
    AutoDoorsSystemDoorReadyToCloseEvent<RoomType>,
]>;

/**
 * Represents a system for doors that open after a period of time.
 *
 * See {@link AutoDoorsSystemEvents} for events to listen to.
 */
export class AutoDoorsSystem<RoomType extends StatefulRoom> extends System<RoomType, AutoDoorsSystemEvents<RoomType>> {
    static doorTimer = 30;
    static openDuration = 10;
    static closeDuration = 10;

    /**
     * The doors in the map.
     */
    doors: AutoDoor<RoomType>[] = [];

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn: return AutoDoorsSystemSpawnDataMessage.deserializeFromReader(reader);
        case DataState.Update: return AutoDoorsSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        // the parsing is different, but both are handled the same
        if (data instanceof AutoDoorsSystemSpawnDataMessage || data instanceof AutoDoorsSystemDataMessage) {
            for (const doorState of data.doorStates) {
                const door = this.doors.find(door => door.doorId === doorState.doorId);
                if (door) {
                    const previouslyOpened = door.isOpen;
                    if (!previouslyOpened && doorState.isOpen) {
                        await this._openDoor(door, data);
                    } else if (previouslyOpened && !doorState.isOpen) {
                        await this._closeDoor(door, data);
                    }
                }
            }
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn: return new AutoDoorsSystemSpawnDataMessage(
            this.doors.map(x => new DoorStateDataMessage(x.doorId, x.isOpen)));
        case DataState.Update:
            const message = new AutoDoorsSystemDataMessage([]);
            for (const door of this.doors) {
                if (door.isDirty) {
                    message.doorStates.push(new DoorStateDataMessage(door.doorId, door.isOpen));
                    door.isDirty = false;
                }
            }
            return message;
        }
        return undefined;
    }

    async processFixedUpdate(delta: number) {
        for (const door of this.doors) {
            await door.processFixedUpdate(delta);
        }
    }
    
    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return undefined;
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        void player, message;
    }

    protected async _closeDoor(door: AutoDoor<RoomType>, originMessage: AutoDoorsSystemSpawnDataMessage|AutoDoorsSystemDataMessage|null) {
        door.isOpen = false;
        door.setCloseDuration();
        if (door instanceof AutoOpenDoor) {
            door.cooldownTimer = AutoDoorsSystem.doorTimer;
            door.duration = AutoDoorsSystem.closeDuration;
        }
        const ev = await this.emit(new AutoDoorsSystemCloseDoorEvent(this, originMessage, door));
        if (ev.pendingRevert) {
            // get rid of the cooldown manually, since this isn't networked
            if (door instanceof AutoOpenDoor) {
                door.cooldownTimer = 0;
                door.duration = 0;
            }
            if (originMessage === null) {
                door.isOpen = true;
            } else {
                await this.openDoorWithAuth(door);
            }
        }
    }

    async closeDoorWithAuth(door: AutoDoor<RoomType>) {
        await this._closeDoor(door, null);
        door.pushDataUpdate();
    }

    protected async _openDoor(door: AutoDoor<RoomType>, originMessage: AutoDoorsSystemSpawnDataMessage|AutoDoorsSystemDataMessage|null) {
        door.isOpen = true;
        door.setOpenDuration();
        const ev = await this.emit(new AutoDoorsSystemOpenDoorEvent(this, originMessage, door));
        if (ev.pendingRevert) {
            if (originMessage === null) {
                door.isOpen = false;
            } else {
                await this.closeZoneRequest(door.zone);
            }
        }
    }

    async openDoorWithAuth(door: AutoDoor<RoomType>) {
        await this._openDoor(door, null);
        door.pushDataUpdate();
    }
    
    async closeZoneWithAuth(systemType: SystemType) {
        for (const door of this.doors) {
            if (door.zone === systemType) {
                await this.closeDoorWithAuth(door);
            }
        }
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
}
