import { Vector2, HazelReader, HazelWriter } from "@skeldjs/util";

import { DataMessage, RpcMessage } from "@skeldjs/protocol";
import { RpcMessageTag, SpawnType } from "@skeldjs/constant";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerData } from "../PlayerData";
import { Hostable } from "../Hostable";
import { NetworkUtils } from "../utils/net";

export interface CustomNetworkTransformData {
    seqId: number;
    position: Vector2;
    velocity: Vector2;
}

export interface CustomNetworkTransformEvents extends NetworkableEvents {
    /**
     * Emitted when the player moves.
     */
    "player.move": {
        /**
         * The position that the player is moving towards.
         */
        position: Vector2;
        /**
         * The velocity of the player.
         */
        velocity: Vector2;
    };
    /**
     * Emitted when the player snaps to a position.
     */
    "player.snapto": {
        /**
         * The position that the player snapped to.
         */
        position: Vector2;
    };
}

/**
 * Represents player component for networking movement.
 *
 * See {@link CustomNetworkTransformEvents} for events to listen to.
 */
export class CustomNetworkTransform extends Networkable<
    CustomNetworkTransformData,
    CustomNetworkTransformEvents
> {
    static type = SpawnType.Player as const;
    type = SpawnType.Player as const;

    static classname = "CustomNetworkTransform" as const;
    classname = "CustomNetworkTransform" as const;

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

    constructor(
        room: Hostable<any>,
        netid: number,
        ownerid: number,
        data?: HazelReader | CustomNetworkTransformData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as PlayerData;
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

        this.emit("player.move", {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y,
            },
        });
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean = false) {
        writer.uint16(this.seqId);
        writer.vector(this.position);
        writer.vector(this.velocity);
        this.dirtyBit = 0;
        return true;
    }

    HandleRpc(callid: RpcMessageTag, reader: HazelReader) {
        switch (callid) {
            case RpcMessageTag.SnapTo:
                const seqId = reader.uint16();
                const position = reader.vector();

                if (NetworkUtils.seqIdGreaterThan(seqId, this.seqId)) {
                    this.seqId = seqId;
                    this.position = position;
                    this.velocity = { x: 0, y: 0 };
                    this.emit("player.snapto", {
                        position: {
                            x: this.position.x,
                            y: this.position.y,
                        },
                    });
                }
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
     *   player.transform.move(ev.data.position);
     * });
     * ```
     */
    async move(position: Vector2, velocity: Vector2 = { x: 0, y: 0 }) {
        this.seqId += 1;

        if (this.seqId > 2 ** 16 - 1) {
            this.seqId = 1;
        }

        this.position = position;
        this.velocity = velocity;

        this.dirtyBit = 1;
        const writer = HazelWriter.alloc(10);
        this.Serialize(writer, false);

        await this.room.broadcast(
            [new DataMessage(this.netid, writer.buffer)],
            false
        );

        this.emit("player.move", {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y,
            },
        });
    }

    /**
     * Instantly snap to a position (no lerping).
     * @param position The position to snap to.
     * @example
     *```typescript
     * // Instantly teleport to wherever the host moves.
     * host.transform.on("player.move", ev => {
     *   player.transform.snapTo(ev.data.position);
     * });
     * ```
     */
    async snapTo(position: Vector2) {
        this.seqId += 1;

        if (this.seqId > 2 ** 16 - 1) {
            this.seqId = 1;
        }

        this.position = position;
        this.dirtyBit = 0;

        const writer = HazelWriter.alloc(4);
        writer.vector(this.position);

        await this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.SnapTo, writer.buffer)
        );

        this.emit("player.snapto", {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
        });
    }
}
