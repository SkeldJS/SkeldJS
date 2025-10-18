import { Vector2, HazelReader, HazelWriter } from "@skeldjs/hazel";

import {
    BaseDataMessage,
    BaseRpcMessage,
    CustomNetworkTransformSpawnDataMessage,
    DataMessage,
    RpcMessage,
    SnapToMessage,
    CustomNetworkTransformDataMessage,
} from "@skeldjs/protocol";

import { RpcMessageTag, SpawnType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { DataState, NetworkedObject, NetworkedObjectEvents } from "../../NetworkedObject";
import { Player } from "../../Player";
import { StatefulRoom } from "../../StatefulRoom";

import {
    PlayerMoveEvent,
    PlayerSnapToEvent
} from "../../events";

import { sequenceIdGreaterThan, SequenceIdType } from "../../utils/sequenceIds";

export type CustomNetworkTransformEvents<RoomType extends StatefulRoom> = NetworkedObjectEvents<RoomType> &
    ExtractEventTypes<[
        PlayerMoveEvent<RoomType>,
        PlayerSnapToEvent<RoomType>
    ]>;

/**
 * Represents player component for networking movement.
 *
 * See {@link CustomNetworkTransformEvents} for events to listen to.
 */
export class CustomNetworkTransform<RoomType extends StatefulRoom> extends NetworkedObject<RoomType, CustomNetworkTransformEvents<RoomType>> {
    /**
     * The current sequence ID.
     */
    seqId: number;

    /**
     * The current position of the player.
     */
    position: Vector2;

    /**
     * The player that this component belongs to.
     */
    player: Player<RoomType>;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
    ) {
        super(room, spawnType, netId, ownerId, flags);

        this.seqId = 0;
        this.position = Vector2.null;

        this.player = this.owner as Player<RoomType>;
    }
    
    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }

    async processAwake(): Promise<void> {
        void 0;
    }

    parseData(state: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (state) {
            case DataState.Spawn: return CustomNetworkTransformSpawnDataMessage.deserializeFromReader(reader);
            case DataState.Update: return CustomNetworkTransformDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof CustomNetworkTransformSpawnDataMessage) {
            const oldPosition = this.position;
            this.seqId = data.sequenceId;
            this.position = data.position;
            await this.emit(new PlayerMoveEvent(this.room, this.player, oldPosition, this.position));
        } else if (data instanceof CustomNetworkTransformDataMessage) {
            const oldPosition = this.position;
            for (let i = 0; i < data.positions.length; i++) {
                const position = data.positions[i];
                const sequenceId = data.sequenceId + i;
                if (!sequenceIdGreaterThan(sequenceId, this.seqId, SequenceIdType.Integer)) continue;
                this.position = position;
                this.seqId = sequenceId;
            }
            await this.emit(new PlayerMoveEvent(this.room, this.player, oldPosition, this.position));
        }
    }

    createData(state: DataState): BaseDataMessage | undefined {
        switch (state) {
            case DataState.Spawn: return new CustomNetworkTransformSpawnDataMessage(this.seqId, this.position);
            case DataState.Update: return new CustomNetworkTransformDataMessage(this.seqId, [ this.position ]);
        }
        return undefined;
    }

    parseRemoteCall(callTag: RpcMessageTag, reader: HazelReader) {
        switch (callTag) {
            case RpcMessageTag.SnapTo: return SnapToMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {
        if (rpc instanceof SnapToMessage) return await this._handleSnapTo(rpc);
    }

    /**
     * Move to a position (lerps towards).
     * @param position The position to move towards.
     * @example
     *```typescript
     * // Follow the host
     * host.transform.on("player.move", ev => {
     *   player.transform.move(ev.position);
     * });
     * ```
     */
    async move(position: Vector2) {
        this.seqId += 1;

        if (this.seqId > 2 ** 16 - 1) {
            this.seqId = 1;
        }

        const oldPosition = new Vector2(this.position);
        this.position = new Vector2(position);

        this.requestDataState(DataState.Update);

        await this.emit(
            new PlayerMoveEvent(
                this.room,
                this.player,
                new Vector2(oldPosition),
                new Vector2(this.position)
            )
        );
    }

    private async _handleSnapTo(rpc: SnapToMessage) {
        if (sequenceIdGreaterThan(rpc.sequenceid, this.seqId, SequenceIdType.Short)) {
            const oldPosition = this.position;

            this.seqId = rpc.sequenceid;
            this.position = rpc.position;

            const newPosition = new Vector2(this.position);

            const ev = await this.emit(
                new PlayerSnapToEvent(
                    this.room,
                    this.player,
                    rpc,
                    oldPosition,
                    newPosition
                )
            );

            if (
                ev.alteredPosition.x !== newPosition.x ||
                ev.alteredPosition.y !== newPosition.y
            ) {
                this.position = new Vector2(ev.alteredPosition);
                this._rpcSnapTo(ev.alteredPosition);
            }
        }
    }

    private _snapTo(position: Vector2) {
        this.position = position;
    }

    private _rpcSnapTo(position: Vector2) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SnapToMessage(new Vector2(position), this.seqId)
            )
        );
    }

    /**
     * Instantly snap to a position without lerping.
     * @param position The position to snap to.
     * @example
     *```typescript
     * // Instantly teleport to wherever the host moves.
     * host.transform.on("player.move", ev => {
     *   client.me.transform.snapTo(ev.position);
     * });
     * ```
     */
    async snapTo(position: Vector2, rpc?: boolean): Promise<void>;
    /**
     * Instantly snap to a position without lerping.
     * @param x The X position to snap to.
     * @param y The Y position to snap to.
     * @example
     *```typescript
     * // Instantly teleport to wherever the host moves.
     * host.transform.on("player.move", ev => {
     *   client.me.transform.snapTo(ev.position.x, ev.position.y);
     * });
     * ```
     */
    async snapTo(x: number, y: number, rpc?: boolean | undefined): Promise<void>;
    async snapTo(x: number | Vector2, y?: number | boolean, rpc?: boolean) {
        this.seqId += 1;

        if (this.seqId > 2 ** 16 - 1) {
            this.seqId = 1;
        }

        // SnapTo can be considered an update for movement data for the clients
        this.cancelDataState(DataState.Update);

        const oldPosition = this.position;

        if (typeof x === "number") {
            return this.snapTo(new Vector2(x, y as number || 0), rpc ?? true);
        }

        this._snapTo(x);

        const ev = await this.emit(
            new PlayerSnapToEvent(
                this.room,
                this.player,
                undefined,
                oldPosition,
                x
            )
        );

        if (
            ev.alteredPosition.x !== x.x ||
            ev.alteredPosition.y !== x.y
        ) {
            this.position = new Vector2(ev.alteredPosition);
        }

        if (rpc ?? y as boolean ?? true) {
            this._rpcSnapTo(this.position);
        }
    }
}
