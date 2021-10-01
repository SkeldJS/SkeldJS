import { Vector2, HazelReader, HazelWriter } from "@skeldjs/util";

import {
    BaseRpcMessage,
    DataMessage,
    RpcMessage,
    SnapToMessage,
} from "@skeldjs/protocol";
import { RpcMessageTag, SpawnType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "../../Networkable";
import { PlayerData } from "../../PlayerData";
import { Hostable } from "../../Hostable";
import { NetworkUtils } from "../../utils/net";

import {
    PlayerMoveEvent,
    PlayerSnapToEvent
} from "../../events";
import { PlayerControl } from "../PlayerControl";

export interface CustomNetworkTransformData {
    seqId: number;
    position: Vector2;
    velocity: Vector2;
}

export type CustomNetworkTransformEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> &
    ExtractEventTypes<[
        PlayerMoveEvent<RoomType>,
        PlayerSnapToEvent<RoomType>
    ]>;

/**
 * Represents player component for networking movement.
 *
 * See {@link CustomNetworkTransformEvents} for events to listen to.
 */
export class CustomNetworkTransform<RoomType extends Hostable = Hostable> extends Networkable<
    CustomNetworkTransformData,
    CustomNetworkTransformEvents<RoomType>,
    RoomType
> implements CustomNetworkTransformData {
    /**
     * The previous sequence ID.
     */
    oldSeqId: number;

    /**
     * The current sequence ID.
     */
    seqId: number;

    /**
     * The current position of the player.
     */
    position: Vector2;

    /**
     * The velocity of the player.
     */
    velocity: Vector2;

    /**
     * The player that this component belongs to.
     */
    player: PlayerData<RoomType>;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | CustomNetworkTransformData,
        playerControl?: PlayerControl<RoomType>
    ) {
        super(room, spawnType, netid, ownerid, flags, data);

        this.oldSeqId ||= 0;
        this.seqId ||= 0;
        this.position ||= Vector2.null;
        this.velocity ||= Vector2.null;

        this.player = this.owner as PlayerData<RoomType>;

        if (playerControl) {
            this.components = playerControl.components;
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean = false) {
        const newSeqId = reader.uint16();

        if (!NetworkUtils.seqIdGreaterThan(newSeqId, this.seqId)) {
            return;
        }

        this.seqId = newSeqId;

        this.position = reader.vector();
        this.velocity = reader.vector();

        this.emit(
            new PlayerMoveEvent(
                this.room,
                this.player,
                new Vector2(this.position),
                new Vector2(this.velocity)
            )
        );
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean = false) {
        writer.uint16(this.seqId);
        writer.vector(this.position);
        writer.vector(this.velocity);
        this.dirtyBit = 0;
        return true;
    }

    async HandleRpc(rpc: BaseRpcMessage) {
        switch (rpc.messageTag) {
            case RpcMessageTag.SnapTo:
                await this._handleSnapTo(rpc as SnapToMessage);
                break;
        }
    }

    /**
     * Move to a position (lerps towards).
     * @param position The position to move towards.
     * @param velocity The velocity to display moving at.
     * @example
     *```typescript
     * // Follow the host
     * host.transform.on("player.move", ev => {
     *   player.transform.move(ev.position.x, ev.position.y);
     * });
     * ```
     */
    async move(x: number, y: number, velocity: Vector2 = Vector2.null) {
        this.seqId += 1;

        if (this.seqId > 2 ** 16 - 1) {
            this.seqId = 1;
        }

        this.position.x = x;
        this.position.y = y;
        this.velocity = velocity;

        this.dirtyBit = 1;
        const writer = HazelWriter.alloc(10);
        this.Serialize(writer, false);

        await this.room.broadcast(
            [new DataMessage(this.netId, writer.buffer)],
            false
        );

        this.emit(
            new PlayerMoveEvent(
                this.room,
                this.player,
                new Vector2(this.position),
                new Vector2(this.velocity)
            )
        );
    }

    private async _handleSnapTo(rpc: SnapToMessage) {
        if (NetworkUtils.seqIdGreaterThan(rpc.sequenceid, this.seqId)) {
            const oldPosition = this.position;

            this.seqId = rpc.sequenceid;
            this.position = rpc.position;
            this.velocity = Vector2.null;

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
                this.snapTo(ev.alteredPosition);
            }
        }
    }

    private _snapTo(x: number, y: number) {
        this.position.x = x;
        this.position.y = y;
    }

    private _rpcSnapTo(position: Vector2) {
        this.room.stream.push(
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
    snapTo(position: Vector2): void;
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
    snapTo(x: number, y: number): void;
    snapTo(x: number | Vector2, y?: number) {
        this.seqId += 1;

        if (this.seqId > 2 ** 16 - 1) {
            this.seqId = 1;
        }

        this.dirtyBit = 0;

        if (x instanceof Vector2) {
            this._snapTo(x.x, x.y);
        } else if (y) {
            this._snapTo(x, y);
        }

        this._rpcSnapTo(this.position);
    }
}
