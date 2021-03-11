import { EventEmitter } from "@skeldjs/events";
import dgram from "dgram";

import { SkeldjsServer } from "./server";

import {
    EncodeVersion,
    unary,
    createMissingBitfield,
    SentPacket,
} from "@skeldjs/util";

import { DisconnectReason, Opcode, PayloadTag } from "@skeldjs/constant";

import {
    ClientboundPacket,
    GameDataMessage,
    PayloadMessageClientbound,
} from "@skeldjs/protocol";

import { Room } from "./Room";

export type RemoteClientEvents = {
    "remote.connected": {
        username: string;
        version: number;
    };
    "remote.joinroom": {
        code: number;
        found: Room;
    }
};

export class RemoteClient extends EventEmitter<RemoteClientEvents> {
    nonce: number;

    version: number;
    username: string;

    identified: boolean;
    disconnected: boolean;

    room: Room;

    packets_sent: SentPacket[];
    packets_recv: number[];

    stream: GameDataMessage[];

    constructor(
        private server: SkeldjsServer,
        public readonly remote: dgram.RemoteInfo,
        public readonly clientid: number
    ) {
        super();

        this.nonce = 0;
        this.room = null;

        this.packets_sent = [];
        this.packets_recv = [];
        this.stream = [];
    }

    async emit(...args: any[]) {
        const event = args[0] as keyof RemoteClientEvents;
        const data = args[1] as any;

        this.server.emit(event, {
            remote: this,
            ...data
        });

        return super.emit(event, data);
    }

    identify(username: string, version: string | number) {
        this.username = username;

        if (typeof version === "number") {
            this.version = version;
        } else {
            const [year, month, day, revision] = version
                .split(".")
                .map(unary(parseInt));
            this.version = EncodeVersion(year, month, day, revision);
        }
    }

    async sendPayload(
        reliable: boolean,
        ...payloads: PayloadMessageClientbound[]
    ) {
        return await this.server.sendPayload(this, reliable, ...payloads);
    }

    async send(packet: ClientboundPacket) {
        return await this.server.send(this, packet);
    }

    async ack(nonce: number) {
        await this.send({
            op: Opcode.Acknowledge,
            nonce,
            missingPackets: createMissingBitfield(this.packets_sent),
        });
    }

    async disconnect(reason: DisconnectReason = -1, message?: string) {
        if (this.room) {
            await this.room.handleLeave(this.clientid);
            for (const [, remote] of this.room.remotes) {
                remote.sendPayload(true, {
                    tag: PayloadTag.RemovePlayer,
                    code: this.room.code,
                    clientid: this.clientid,
                    hostid: this.room.options.SaaH
                        ? remote.clientid
                        : this.room.hostid,
                    reason: 0,
                });
            }
            this.room = null;
        }

        if (reason === -1) {
            this.server.send(this, {
                op: Opcode.Disconnect,
            });
        } else {
            this.server.send(this, {
                op: Opcode.Disconnect,
                reason,
                message,
            });
        }
        this.disconnected = true;
    }

    async joinError(reason: DisconnectReason, message?: string) {
        this.server.send(this, {
            op: Opcode.Reliable,
            payloads: [
                {
                    tag: PayloadTag.JoinGame,
                    error: true,
                    reason,
                    message,
                },
            ],
        });
    }
}
