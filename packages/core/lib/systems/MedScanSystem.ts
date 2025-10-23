import { HazelReader } from "@skeldjs/hazel";
import { BaseSystemMessage, DtlsHelloPacket, MedScanSystemDataMessage, MedScanSystemMessage, MedScanUpdate, RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export type MedScanSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling the medbay scan queue.
 *
 * See {@link MedScanSystemEvents} for events to listen to.
 */
export class MedScanSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, MedScanSystemEvents<RoomType>> {
    /**
     * The current queue to access the medbay scan.
     */
    queue: Player<RoomType>[] = [];

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return MedScanSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof MedScanSystemDataMessage) {
            this.queue = [];
            for (const playerId of data.playerIdQueue) {
                const player = this.shipStatus.room.getPlayerByPlayerId(playerId);
                if (player) this.queue.push(player);
            }
            // TODO: check queue for updates, and event: update queue
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            const message = new MedScanSystemDataMessage([]);
            for (const player of this.queue) {
                const playerId = player.getPlayerId();
                if (playerId !== undefined) {
                    message.playerIdQueue.push(playerId);
                }
            }
            return message;
        }
        return undefined;
    }
    
    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return MedScanSystemMessage.deserializeFromReader(reader);
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof MedScanSystemMessage) {
            switch (message.action) {
            case MedScanUpdate.AddPlayer:
                if (this.queue.indexOf(player) === -1) {
                    this.queue.push(player);
                    // TODO: event: update queue
                }
                break;
            case MedScanUpdate.RemovePlayer:
                const idx = this.queue.indexOf(player);
                if (idx !== -1) {
                    this.queue.splice(idx, 1);
                    // TODO: event: update queue
                }
                break;
            }
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        void deltaSeconds;
    }
}
