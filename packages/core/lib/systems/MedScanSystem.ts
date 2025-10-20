import { HazelReader } from "@skeldjs/hazel";
import { BaseDataMessage, MedScanSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
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

    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return MedScanSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof MedScanSystemDataMessage) {
            this.queue = [];
            for (const playerId of data.playerIdQueue) {
                const player = this.ship.room.getPlayerByPlayerId(playerId);
                if (player) this.queue.push(player);
            }
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
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
}
