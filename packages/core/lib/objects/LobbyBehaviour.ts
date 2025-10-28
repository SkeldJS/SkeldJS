import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/hazel";
import { BaseSystemMessage, BaseRpcMessage, LobbyTimeExpiringMessage, RpcMessage, ExtendLobbyTimerMessage, LobbyExtension } from "@skeldjs/protocol";
import { RpcMessageTag } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { DataState, NetworkedObject, NetworkedObjectEvents } from "../NetworkedObject";
import { StatefulRoom } from "../StatefulRoom";
import { RoomLobbyTimeExpiringEvent } from "../events";

export type LobbyBehaviourEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a room object for the Lobby map.
 *
 * See {@link LobbyBehaviourEvents} for events to listen to.
 */
export class LobbyBehaviour<RoomType extends StatefulRoom> extends NetworkedObject<RoomType, LobbyBehaviourEvents<RoomType>> {
    static spawnPositions = [
        new Vector2(-1.6, 2.4),
        new Vector2(-1.3, 2.5),
        new Vector2(-1.1, 2.5),
        new Vector2(-0.8, 2.6),
        new Vector2(-0.6, 2.7),
        new Vector2(0.7, 2.8),
        new Vector2(0.9, 2.6),
        new Vector2(1.1, 2.6),
        new Vector2(1.4, 2.5),
        new Vector2(1.7, 2.4),
    ];

    get owner() {
        return super.owner as RoomType;
    }

    parseData(state: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        void data;
    }

    createData(state: DataState): BaseSystemMessage | undefined {
        return undefined;
    }

    parseRemoteCall(rpcTag: RpcMessageTag, reader: HazelReader): BaseRpcMessage | undefined {
        switch (rpcTag) {
        case RpcMessageTag.LobbyTimeExpiring: return LobbyTimeExpiringMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleRemoteCall(rpc: BaseRpcMessage): Promise<void> {
        if (rpc instanceof LobbyTimeExpiringMessage) return await this._handleLobbyTimeExpiring(rpc);
    }

    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }

    async processAwake(): Promise<void> {
        void 0;
    }

    async _handleLobbyTimeExpiring(rpc: LobbyTimeExpiringMessage) {
        const ev = await this.room.emit(
            new RoomLobbyTimeExpiringEvent(
                this.room,
                rpc.secondsRemaining,
                rpc.availableExtension
            )
        );

        if (rpc.availableExtension && ev.canceled) {
            await this.extendLobbyTimer(rpc.availableExtension.extensionId);
        }
    }

    async notifyLobbyTimeExpiring(secondsRemaining: number, extensionAvailable: LobbyExtension|null) {
        await this.room.broadcastImmediate([
            new RpcMessage(
                this.netId,
                new LobbyTimeExpiringMessage(secondsRemaining, extensionAvailable),
            )
        ]);
    }

    async extendLobbyTimer(extensionId: number) {
        await this.room.broadcastImmediate([
            new RpcMessage(
                this.netId,
                new ExtendLobbyTimerMessage(extensionId),
            )
        ]);
    }
}
