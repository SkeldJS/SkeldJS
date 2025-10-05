import { Vector2, HazelReader, HazelWriter } from "@skeldjs/util";

import {
    BaseRpcMessage,
    DataMessage,
    RpcMessage,
    SnapToMessage,
} from "@skeldjs/protocol";
import { RpcMessageTag, SpawnType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { NetworkedObject, NetworkedObjectEvents } from "../../NetworkedObject";
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

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    deserializeFromReader(reader: HazelReader, spawn: boolean = false) {
        if (spawn) {
            const newSeqId = reader.uint16();
            this.deserializePosition(newSeqId, reader);
        } else {
            const baseSeqId = reader.uint16();
            const numPositions = reader.packed();
            for (let i = 0; i < numPositions; i++) {
                const newSeqId = baseSeqId + i;
                this.deserializePosition(newSeqId, reader);
            }
        }
    }

    private deserializePosition(sequenceId: number, reader: HazelReader) {
        const newPosition = reader.vector();
        if (!sequenceIdGreaterThan(sequenceId, this.seqId, SequenceIdType.Integer)) return;
        const oldPosition = this.position;
        this.position = newPosition;
        this.seqId = sequenceId;
        this.emitSync(new PlayerMoveEvent(this.room, this.player, oldPosition, newPosition));
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    serializeToWriter(writer: HazelWriter, spawn: boolean = false) {
        if (spawn) {
            writer.uint16(this.seqId);
            writer.vector(this.position);
        } else {
            // TODO: position queue
            writer.uint16(this.seqId);
            writer.packed(1);
            writer.vector(this.position);
        }
        return true;
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {
        switch (rpc.messageTag) {
            case RpcMessageTag.SnapTo:
                await this._handleSnapTo(rpc as SnapToMessage);
                break;
        }
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

        this.dirtyBit = 1;
        const writer = HazelWriter.alloc(10);
        this.serializeToWriter(writer, false);
        this.dirtyBit = 0;

        await this.room.broadcast([new DataMessage(this.netId, writer.buffer)], undefined, undefined, undefined, false);

        this.emitSync(
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
        this.room.messageStream.push(
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

        this.dirtyBit = 0;

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
