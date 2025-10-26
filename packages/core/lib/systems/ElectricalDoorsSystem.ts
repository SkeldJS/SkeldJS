import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage, ElectricalDoorsSystemDataMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";

import { StatefulRoom } from "../StatefulRoom";
import { Door, DoorEvents } from "./DoorsSystem";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";

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

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return ElectricalDoorsSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
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

    createData(dataState: DataState): BaseSystemMessage | undefined {
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
    
    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return undefined;
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        void player, message;
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        void deltaSeconds;
    }
}
