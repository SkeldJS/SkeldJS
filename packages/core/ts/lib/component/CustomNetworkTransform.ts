import {
    Vector2,
    readVector2,
    writeVector2,
    HazelBuffer
} from "@skeldjs/util";

import { RpcMessage } from "@skeldjs/protocol";

import {
    MessageTag,
    RpcTag,
    SpawnID
} from "@skeldjs/constant";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerData } from "../PlayerData";
import { Hostable } from "../Hostable";

export interface CustomNetworkTransformData {
    seqId: number;
    position: Vector2;
    velocity: Vector2;
}

export type CustomNetworkTransformEvents = NetworkableEvents & {
    "player.move": {
        position: Vector2;
        velocity: Vector2;
    };
    "player.snapto": {
        position: Vector2;
    };
}

export class CustomNetworkTransform extends Networkable<CustomNetworkTransformEvents> {
    static type = SpawnID.Player as const;
    type = SpawnID.Player as const;

    static classname = "CustomNetworkTransform" as const;
    classname = "CustomNetworkTransform" as const;

    oldSeqId: number;
    seqId: number;
    position: Vector2;
    velocity: Vector2;

    constructor(room: Hostable, netid: number, ownerid: number, data?: HazelBuffer|CustomNetworkTransformData) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as PlayerData;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        const newSeqId = reader.uint16();

        if (!CustomNetworkTransform.seqIdGreaterThan(newSeqId, this.seqId)) {
            return;
        }

        this.seqId = newSeqId;

        this.position = readVector2(reader);
        this.velocity = readVector2(reader);

        this.emit("player.move", {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y
            }
        });
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean = false) {
        if (this.dirtyBit) {
            writer.uint16(this.seqId);
            writeVector2(writer, this.position);
            writeVector2(writer, this.velocity);
            return true;
        }
        this.dirtyBit = 0;
    }

    HandleRPC(message: RpcMessage) {
        switch (message.rpcid) {
            case RpcTag.SnapTo:
                if (CustomNetworkTransform.seqIdGreaterThan(message.seqId, this.seqId)) {
                    this.seqId = message.seqId;
                    this.position = message.position;
                    this.velocity = { x: 0, y: 0 };
                    this.emit("player.snapto", {
                        position: {
                            x: this.position.x,
                            y: this.position.y
                        }
                    });
                }
                break;
        }
    }

    async move(position: Vector2, velocity: Vector2 = { x: 0, y: 0 }) {
        this.seqId += 1;

        if (this.seqId > 2 ** 16 - 1) {
            this.seqId = 1;
        }

        this.position = position;
        this.velocity = velocity;

        const data = HazelBuffer.alloc(10);
        this.Serialize(data);

        await this.room.broadcast([{
            tag: MessageTag.Data,
            netid: this.netid,
            data
        }], false);

        this.emit("player.move", {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y
            }
        });
    }

    async snapTo(position: Vector2) {
        this.seqId += 1;

        if (this.seqId > 2 ** 16 - 1) {
            this.seqId = 1;
        }

        this.position = position;

        const data = HazelBuffer.alloc(10);
        this.Serialize(data);

        await this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.SnapTo,
            netid: this.netid,
            seqId: this.seqId,
            position
        });

        this.emit("player.snapto", {
            position: {
                x: this.position.x,
                y: this.position.y
            }
        });
    }

    static threshold = 2 ** 15 - 1;

    static seqIdGreaterThan(newSid: number, oldSid: number) {
        if (typeof oldSid !== "number") return true;

        let margin = oldSid - CustomNetworkTransform.threshold;

        if (margin > 2 ** 16 - 1) {
            margin -= 2 ** 16;
        }

        if (oldSid < margin) {
            return newSid > oldSid && newSid <= margin;
        }

        return newSid > oldSid || newSid <= margin;
    }
}
