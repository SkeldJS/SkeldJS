import { HazelReader } from "@skeldjs/hazel";
import { BaseSystemMessage, RepairSystemMessage, SecurityCameraSystemDataMessage, SecurityCameraSystemMessage, SecurityCameraUpdate } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { PlayerControl } from "../objects";

export type SecurityCameraSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling players entering and leaving security cameras.
 *
 * See {@link SecurityCameraSystemEvents} for events to listen to.
 */
export class SecurityCameraSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, SecurityCameraSystemEvents<RoomType>> {
    /**
     * The players currently looking at cameras.
     */
    players: Set<Player<RoomType>> = new Set;

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return SecurityCameraSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof SecurityCameraSystemDataMessage) {
            const before = new Set(this.players);
            this.players.clear();

            for (const playerId of data.playerIds) {
                const player = this.shipStatus.room.getPlayerByPlayerId(playerId);
                if (player) {
                    this.players.add(player);
                    if (!before.has(player)) {
                        // TODO: event: player was added
                    }
                }
            }

            for (const player of before) {
                if (this.players.has(player))
                    continue;

                // TODO: event: player was removed
            }
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            const message = new SecurityCameraSystemDataMessage([]);
            for (const player of this.players) {
                const playerId = player.getPlayerId();
                if (playerId !== undefined) {
                    message.playerIds.push(playerId);
                }
            }
            return message;
        }
        return undefined;
    }

    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return SecurityCameraSystemMessage.deserializeFromReader(reader);
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof SecurityCameraSystemMessage) {
            switch (message.playerAction) {
            case SecurityCameraUpdate.Remove:
                this.players.delete(player);
                // TODO: event: player was removed
                break;
            case SecurityCameraUpdate.Add:
                this.players.add(player);
                // TODO: event: player was added
                break;
            }
        }
    }
    
    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        void deltaSeconds;
    }
}
