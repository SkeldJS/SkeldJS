import {
    Vector2,
    readVector2,
    writeVector2,
    HazelBuffer
} from "@skeldjs/util";

import { RpcMessage } from "@skeldjs/protocol";

import {
    MessageID,
    Opcode,
    PayloadTag,
    RpcID,
    SpawnID
} from "@skeldjs/constant";

import { Networkable } from "../Networkable"
import { PlayerData } from "../PlayerData"
import { Room } from "../Room";

export interface CustomNetworkTransformData {
    seqId: number;
    position: Vector2;
    velocity: Vector2;
}

export interface CustomNetworkTransform {}

export class CustomNetworkTransform extends Networkable<PlayerData> {
    static type = SpawnID.Player;
    type = SpawnID.Player;

    static classname = "CustomNetworkTransform";
    classname = "CustomNetworkTransform";

    oldSeqId: number;
    seqId: number;
    position: Vector2;
    velocity: Vector2;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|CustomNetworkTransformData) {
        super(room, netid, ownerid, data);
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

        this.emit("move", this.position, this.velocity);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean = false) {
        writer.uint16(this.seqId);
        writeVector2(writer, this.position);
        writeVector2(writer, this.velocity);
    }

    /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    FixedUpdate() {

    }

    HandleRPC(message: RpcMessage) {
        switch (message.rpcid) {
            case RpcID.SnapTo:
                if (CustomNetworkTransform.seqIdGreaterThan(message.seqId, this.seqId)) {
                    this.seqId = message.seqId;
                    this.position = message.position;
                    this.velocity = { x: 0, y: 0 };
                    this.emit("snapTo", this.position);
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
        
        await this.room.client.send({
            op: Opcode.Unreliable,
            payloads: [
                {
                    tag: PayloadTag.GameData,
                    code: this.room.code,
                    messages: [
                        {
                            tag: MessageID.Data,
                            netid: this.netid,
                            data
                        }
                    ]
                }
            ]
        });
        
        this.emit("move", this.position, this.velocity);
    }

    async snapTo(position: Vector2) {
        this.seqId += 1;
        
        if (this.seqId > 2 ** 16 - 1) {
            this.seqId = 1;
        }

        this.position = position;
        
        const data = HazelBuffer.alloc(10);
        this.Serialize(data);
        
        await this.room.client.send({
            op: Opcode.Reliable,
            payloads: [
                {
                    tag: PayloadTag.GameData,
                    code: this.room.code,
                    messages: [
                        {
                            tag: MessageID.RPC,
                            rpcid: RpcID.SnapTo,
                            netid: this.netid,
                            seqId: this.seqId,
                            position
                        }
                    ]
                }
            ]
        });
        
        this.emit("snapTo", this.position);
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