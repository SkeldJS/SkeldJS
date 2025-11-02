import { HazelReader } from "@skeldjs/hazel";
import { AutoDoorsSystemDataMessage, AutoDoorsSystemSpawnDataMessage, BaseSystemMessage, DoorStateDataMessage, RepairSystemMessage } from "@skeldjs/au-protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { System } from "./System";

import { StatefulRoom } from "../StatefulRoom";
import { Door, DoorEvents } from "./Doors";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";
import { SystemType } from "@skeldjs/au-constants";

/**
 * Represents an auto opening door for the {@link AutoDoorsSystem}.
 *
 * See {@link DoorEvents} for events to listen to.
 */
export class AutoOpenDoor<RoomType extends StatefulRoom> extends Door<RoomType> {
    cooldownTimer: number = 0;
    closedDuration: number = 0;
    isDirty: boolean = false;

    pushDataUpdate() {
        this.isDirty = true;
        this.doorSystem.pushDataUpdate();
    }

    async closeWithAuth(): Promise<void> {
        this.cooldownTimer = AutoDoorsSystem.doorTimer;
        this.closedDuration = AutoDoorsSystem.closedDuration;
        await super.closeWithAuth();
    }

    async processFixedUpdate(deltaSeconds: number) {
        if (!this.isOpen) {
            this.closedDuration -= deltaSeconds;

            if (this.closedDuration < 0) {
                await this.openWithAuth();
            }
        }
    }
}

export type AutoDoorsSystemEvents<RoomType extends StatefulRoom> = DoorEvents<RoomType> & ExtractEventTypes<[]>;

/**
 * Represents a system for doors that open after a period of time.
 *
 * See {@link AutoDoorsSystemEvents} for events to listen to.
 */
export class AutoDoorsSystem<RoomType extends StatefulRoom> extends System<RoomType, AutoDoorsSystemEvents<RoomType>> {
    static doorTimer = 30;
    static closedDuration = 10;

    /**
     * The doors in the map.
     */
    doors: AutoOpenDoor<RoomType>[] = [];

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
                if (this.doors[doorState.index]) {
                    this.doors[doorState.index].isOpen = doorState.isOpen;
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
            console.log(message);
            return message;
        }
        return undefined;
    }

    async processFixedUpdate(delta: number) {
        for (const door of this.doors) {
            if (!door.isOpen) {
                await door.processFixedUpdate(delta);
            }
        }
    }
    
    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return undefined;
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        void player, message;
    }
    
    async closeDoorsWithAuth(systemType: SystemType) {
        for (const door of this.doors) {
            if (door.associatedZone === systemType) {
                await door.closeWithAuth();
            }
        }
    }
}
