import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage, ElectricalDoorsSystemDataMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";

import { StatefulRoom } from "../StatefulRoom";
import { Door, DoorEvents } from "./DoorsSystem";
import { DataState } from "../NetworkedObject";

export type ElectricalDoorsSystemEvents<RoomType extends StatefulRoom> = DoorEvents<RoomType> & ExtractEventTypes<[]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link ElectricalDoorsSystemEvents} for events to listen to.
 */
export class ElectricalDoorsSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, ElectricalDoorsSystemEvents<RoomType>> {
    /**
     * The doors in the map.
     */
    doors: Door<RoomType>[] = [];

    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return ElectricalDoorsSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof ElectricalDoorsSystemDataMessage) {
            const openDoorsSet: Set<number> = new Set(data.openDoors);
            for (const door of this.doors) {
                if (openDoorsSet.has(door.doorId)) {
                    this.doors[door.doorId].isOpen = true;
                } else {
                    this.doors[door.doorId].isOpen = false;
                }
            }
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            const message = new ElectricalDoorsSystemDataMessage([]);
            for (const door of this.doors) {
                if (door.isOpen) {
                    message.openDoors.push(door.doorId);
                }
            }
            return message;
        }
        return undefined;
    }
}
