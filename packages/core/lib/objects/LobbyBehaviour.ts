import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/hazel";
import { BaseDataMessage, BaseRpcMessage } from "@skeldjs/protocol";
import { RpcMessageTag } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { DataState, NetworkedObject, NetworkedObjectEvents } from "../NetworkedObject";
import { StatefulRoom } from "../StatefulRoom";

export type LobbyBehaviourEvents<RoomType extends StatefulRoom> = NetworkedObjectEvents<RoomType> & ExtractEventTypes<[]>;

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

    parseData(state: DataState, reader: HazelReader): BaseDataMessage | undefined {
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        void data;
    }

    createData(state: DataState): BaseDataMessage | undefined {
        return undefined;
    }

    parseRemoteCall(rpcTag: RpcMessageTag, reader: HazelReader): BaseRpcMessage | undefined {
        return undefined;
    }

    async handleRemoteCall(rpc: BaseRpcMessage): Promise<void> {
        void rpc;
    }

    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }

    async processAwake(): Promise<void> {
        void 0;
    }
}
