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

export interface RemoteClientEvents {
    /**
     * Emitted when a remote client connects to the server.
     */
    "remote.connected": {
        /**
         * The username that the remote client identified with.
         */
        username: string;
        /**
         * The version of the remote client's game client.
         */
        version: number;
    };
    /**
     * Emitted when a remote client joins a room.
     */
    "remote.joinroom": {
        /**
         * The code of the room that the remote client joined.
         */
        code: number;
        /**
         * The room that the remote client joined.
         */
        found: Room;
    };
}

/**
 * Represents a remotely connected client.
 *
 * See {@link RemoteClientEvents} for events to listen to.
 */
export class RemoteClient extends EventEmitter<RemoteClientEvents> {
    /**
     * The last unique packet ID of the client.
     */
    nonce: number;

    /**
     * The version of the remote client's game client.
     */
    version: number;

    /**
     * The username of the remote client.
     */
    username: string;

    /**
     * Whether or not the remote client has identified with the server.
     */
    identified: boolean;

    /**
     * Whether or not the remote client has disconnected.
     */
    disconnected: boolean;

    /**
     * The room that the remote client is currently in.
     */
    room: Room;

    /**
     * An array of the last 8 packets that have been sent to the remote client.
     */
    packets_sent: SentPacket[];

    /**
     * An array of the last 8 packets that have been received from the remote client.
     */
    packets_recv: number[];

    /**
     * The message stream to be sent on fixed update.
     */
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

    async emit(...args: any[]): Promise<boolean> {
        const event = args[0] as keyof RemoteClientEvents;
        const data = args[1] as any;

        this.server.emit(event, {
            remote: this,
            ...data,
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
