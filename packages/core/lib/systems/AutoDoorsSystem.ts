import { HazelReader } from "@skeldjs/hazel";
import { AutoDoorsSystemDataMessage, AutoDoorsSystemSpawnDataMessage, BaseDataMessage, DoorStateDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";

import { StatefulRoom } from "../StatefulRoom";
import { Door, DoorEvents } from "./DoorsSystem";
import { DataState } from "../NetworkedObject";

/**
 * Represents an auto opening door for the {@link AutoDoorsSystem}.
 *
 * See {@link DoorEvents} for events to listen to.
 */
export class AutoOpenDoor<RoomType extends StatefulRoom> extends Door<RoomType> {
    timer: number;
    dirty: boolean;

    constructor(
        protected system: AutoDoorsSystem<RoomType>,
        readonly doorId: number,
        isOpen: boolean
    ) {
        super(system, doorId, isOpen);

        this.timer = 0;
        this.dirty = false;
    }

    pushDataUpdate() {
        this.system.pushDataUpdate();
    }

    async processFixedUpdate(delta: number) {
        this.timer -= delta;

        if (this.timer < 0) {
            // TODO: open door as host
            return true;
        }
        return false;
    }
}

export type AutoDoorsSystemEvents<RoomType extends StatefulRoom> = DoorEvents<RoomType> & ExtractEventTypes<[]>;

/**
 * Represents a system for doors that open after a period of time.
 *
 * See {@link AutoDoorsSystemEvents} for events to listen to.
 */
export class AutoDoorsSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, AutoDoorsSystemEvents<RoomType>> {
    /**
     * The dirty doors to be updated on the next fixed update.
     */
    dirtyBit: number = 0;

    /**
     * The doors in the map.
     */
    doors: AutoOpenDoor<RoomType>[] = [];

    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn: return AutoDoorsSystemSpawnDataMessage.deserializeFromReader(reader);
        case DataState.Update: return AutoDoorsSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        // the parsing is different, but both are handled the same
        if (data instanceof AutoDoorsSystemSpawnDataMessage || data instanceof AutoDoorsSystemDataMessage) {
            for (const doorState of data.doorStates) {
                this.doors[doorState.index] = new AutoOpenDoor(this, doorState.index, doorState.isOpen);
            }
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn: return new AutoDoorsSystemSpawnDataMessage(
            this.doors.map(x => new DoorStateDataMessage(x.doorId, x.isOpen)));
        case DataState.Update:
            const message = new AutoDoorsSystemDataMessage([]);
            for (const door of this.doors) {
                if (door.dirty) {
                    message.doorStates.push(new DoorStateDataMessage(door.doorId, door.isOpen));
                }
            }
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
}
