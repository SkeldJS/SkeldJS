import { EventEmitter } from "events"
import dgram from "dgram"

import { SkeldjsServer } from "./server";
import { createMissingBitfield, SentPacket } from "@skeldjs/util";

import {
    EncodeVersion,
    unary
} from "@skeldjs/util";

import {
    Room,
    DisconnectReason,
    Opcode
} from "@skeldjs/common"

import {
    ClientboundPacket
} from "@skeldjs/protocol"

export class RemoteClient extends EventEmitter {
    nonce: number;

    version: number;
    username: string;

    identified: boolean;
    disconnected: boolean;

    room: Room;

    packets_sent: SentPacket[];
    packets_recv: number[];

    constructor(private server: SkeldjsServer, public readonly remote: dgram.RemoteInfo, public readonly clientid: number) {
        super();
    }

    identify(username: string, version: string|number) {
        this.username = username;

        if (typeof version === "number") {
            this.version = version;
        } else {
            const [ year, month, day, revision ] = version.split(".").map(unary(parseInt));
            this.version = EncodeVersion(year, month, day, revision);
        }
    }

    async send(packet: ClientboundPacket) {
        return await this.server.send(this, packet);
    }

    async ack(nonce: number) {
        await this.send({
            op: Opcode.Acknowledge,
            nonce,
            missingPackets: createMissingBitfield(this.packets_sent)
        });
    }

    async disconnect(reason: DisconnectReason = -1, message?: string) {
        if (reason === -1) {
            this.server.send(this, {
                op: Opcode.Disconnect
            });
        } else {
            this.server.send(this, {
                op: Opcode.Disconnect,
                reason,
                message
            });
        }
    }
}