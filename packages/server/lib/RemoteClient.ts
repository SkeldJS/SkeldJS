import dgram from "dgram";

import { EventEmitter } from "@skeldjs/events";

import {
    EncodeVersion,
    unary
} from "@skeldjs/util";

import {
    DisconnectReason
} from "@skeldjs/constant";

import {
    AcknowledgePacket,
    BaseRootPacket,
    DisconnectPacket,
    GameDataMessage,
    JoinGameMessage,
    ReliablePacket,
    RemovePlayerMessage,
} from "@skeldjs/protocol";

import { SkeldjsServer } from "./server";
import { Room } from "./Room";

export interface SentPacket {
    nonce: number;
    ackd: boolean;
}

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
    private _nonce: number;

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

        this._nonce = 0;
        this.room = null;

        this.packets_sent = [];
        this.packets_recv = [];
        this.stream = [];
    }

    /**
     * An incrementing unique packet ID for the client.
     */
    get nonce() {
        this._nonce++;

        if (this._nonce > 2 ** 16 - 1) {
            this._nonce = 1;
        }

        return this._nonce;
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

    async send(packet: BaseRootPacket) {
        return await this.server.send(this, packet);
    }

    async ack(nonce: number) {
        await this.send(
            new AcknowledgePacket(nonce, this.packets_sent.map(p => p.ackd))
        );
    }

    async disconnect(reason: DisconnectReason = -1, message?: string) {
        if (this.room) {
            await this.room.handleLeave(this.clientid);
            for (const [, remote] of this.room.remotes) {
                remote.send(
                    new ReliablePacket(remote.nonce, [
                        new RemovePlayerMessage(
                            this.room.code,
                            this.clientid,
                            this.room.options.SaaH
                                ? remote.clientid
                                : this.room.hostid,
                            DisconnectReason.None
                        )
                    ])
                );
            }
            this.room = null;
        }

        if (reason === -1) {
            this.send(
                new DisconnectPacket(DisconnectReason.None)
            );
        } else {
            this.send(
                new DisconnectPacket(reason, message, true)
            );
        }
        this.disconnected = true;
    }

    async joinError(reason: DisconnectReason, message?: string) {
        this.send(
            new ReliablePacket(this.nonce, [
                new JoinGameMessage(reason, message)
            ])
        );
    }
}
