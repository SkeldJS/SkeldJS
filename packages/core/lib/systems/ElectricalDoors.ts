import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage, ElectricalDoorsSystemDataMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { System } from "./System";

import { StatefulRoom } from "../StatefulRoom";
import { Door, DoorEvents } from "./Doors";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";

export type ElectricalDoorsSystemEvents<RoomType extends StatefulRoom> = DoorEvents<RoomType> & ExtractEventTypes<[]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link ElectricalDoorsSystemEvents} for events to listen to.
 */
export class ElectricalDoorsSystem<RoomType extends StatefulRoom> extends System<RoomType, ElectricalDoorsSystemEvents<RoomType>> {
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

    async randomizeDoorMaze(roomsDoors: number[][], exitDoorIds: number[]): Promise<void> {
        // Generate a maze-like structure for players to pass through or optionally open doors.
        for (const door of this.doors) door.isOpen = false;

        const visitedRooms: Set<number[]> = new Set;
        let currentRoom = roomsDoors[0];
        let count = 0;
        while (visitedRooms.size < roomsDoors.length && count++ < 10000) {
            const randomDoorId = currentRoom[Math.floor(Math.random() * currentRoom.length)];
            const randomDoor = this.doors[randomDoorId];
            const adjacentRoom = roomsDoors.find(room => room !== currentRoom && room.includes(randomDoor.doorId));

            if (!adjacentRoom) continue;

            const hasVisitedAdjacentRoom = visitedRooms.has(adjacentRoom);
            visitedRooms.add(adjacentRoom);

            // If we haven't visited this adjacent room yet, let's make sure we have
            // a door open to it.
            if (!hasVisitedAdjacentRoom) await randomDoor.openWithAuth();

            // At some point, let's move onto the next room
            if (Math.random() >= 0.5) {
                visitedRooms.add(currentRoom);
                currentRoom = adjacentRoom;
            }
        }

        const openDoorId = Math.floor(Math.random() * exitDoorIds.length);
        for (const doorId of exitDoorIds) {
            if (openDoorId === doorId) {
                await this.doors[doorId].openWithAuth();
            } else {
                await this.doors[doorId].closeWithAuth();
            }
        }
    }
}
