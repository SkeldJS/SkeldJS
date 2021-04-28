import dgram from "dgram";
import { ServerConfig } from "./interface/ServerConfig";

import {
    AcknowledgePacket,
    AlterGameMessage,
    BaseRootPacket,
    DisconnectPacket,
    GameDataMessage,
    GameDataToMessage,
    HelloPacket,
    HostGameMessage,
    JoinedGameMessage,
    JoinGameMessage,
    MessageDirection,
    PacketDecoder,
    PingPacket,
    ReliablePacket,
} from "@skeldjs/protocol";

import { DisconnectReason, SendOption } from "@skeldjs/constant";

import { V2Gen, ritoa, sleep, HazelWriter, HazelReader } from "@skeldjs/util";

import { AlterGameTag } from "@skeldjs/core";
import { EventEmitter } from "@skeldjs/events";

import { RemoteClient, RemoteClientEvents } from "./RemoteClient";

import { Room, RoomEvents } from "./Room";
import { SpecialID } from "./constants/IDs";

const default_config = (): ServerConfig => ({
    versions: ["2020.11.17"],
    port: 22023,
    host: "0.0.0.0",
});

type SkeldjsServerEvents =
    RemoteClientEvents &
    RoomEvents

/**
 * Represents a programmable Among Us region server.
 *
 * See {@link SkeldjsServerEvents} for events to listen to.
 */
export class SkeldjsServer extends EventEmitter<SkeldjsServerEvents> {
    /**
     * The config for the server.
     */
    config: ServerConfig;

    /**
     * The datagram socket for the server.
     */
    socket: dgram.Socket;

    /**
     * The remote clients currently connected to the server.
     */
    remotes: Map<string, RemoteClient>;

    /**
     * The active rooms in the server.
     */
    rooms: Map<number, Room>;

    /**
     * The packet decoder.
     */
    decoder: PacketDecoder;

    private _inc_clientid;

    constructor(config?: Partial<ServerConfig>) {
        super();

        this.config = {
            ...default_config(),
            ...config,
        };
        this._inc_clientid = 0;

        this.socket = dgram.createSocket("udp4");

        this.remotes = new Map();
        this.rooms = new Map();

        this.decoder = new PacketDecoder();

        this.decoder.on(
            HostGameMessage,
            async (message, direction, sender: dgram.RemoteInfo) => {
                const client = this.getOrCreateClient(sender);

                const code = this.generateUniqueCode();
                const room = new Room(this, { SaaH: true });
                room.setHost(SpecialID.SaaH);
                room.code = code;
                room.settings.patch(message.options);

                this.rooms.set(code, room);

                await client.send(
                    new ReliablePacket(client.nonce, [
                        new HostGameMessage(code),
                    ])
                );
            }
        );

        this.decoder.on(
            JoinGameMessage,
            async (message, direction, sender: dgram.RemoteInfo) => {
                const client = this.getOrCreateClient(sender);

                const room = this.rooms.get(message.code);
                if (client.room) {
                    return await client.joinError(
                        DisconnectReason.Custom,
                        "Already in game, please leave your current one before joining a new one."
                    );
                }

                if (!room)
                    return await client.joinError(
                        DisconnectReason.GameNotFound
                    );

                if (room.players.size >= room.settings.maxPlayers)
                    return await client.joinError(DisconnectReason.GameFull);

                const player = await room.handleJoin(client.clientid);
                room.remotes.set(client.clientid, client);
                client.room = room;

                if (!room.hostid) room.hostid = client.clientid;

                await client.send(
                    new ReliablePacket(client.nonce, [
                        new JoinedGameMessage(
                            room.code,
                            client.clientid,
                            room.hostid,
                            [...room.remotes.values()]
                                .filter(
                                    (player) =>
                                        player.clientid !== client.clientid
                                )
                                .map((player) => player.clientid)
                        ),
                        new AlterGameMessage(
                            room.code,
                            AlterGameTag.ChangePrivacy,
                            room.privacy === "public" ? 1 : 0
                        ),
                    ])
                );

                await room.broadcast(null, true, null, [
                    new JoinGameMessage(
                        room.code,
                        client.clientid,
                        room.hostid
                    ),
                ]);

                if (room.options.SaaH) {
                    await player.wait("player.spawn");
                    await Promise.race([
                        Promise.all([
                            player.wait("player.setname"),
                            player.wait("player.setcolor"),
                        ]),
                        sleep(1000),
                    ]);
                    await room.setHost(SpecialID.SaaH);
                }
            }
        );

        this.decoder.on(
            GameDataMessage,
            (message, direction, sender: dgram.RemoteInfo) => {
                const client = this.getOrCreateClient(sender);

                const room = this.rooms.get(message.code);
                if (room) {
                    room.decoder.emitDecoded(message, direction, sender);

                    client.send(
                        new ReliablePacket(client.nonce, [
                            new GameDataMessage(message.code, message.children),
                        ])
                    );
                }
            }
        );

        this.decoder.on(GameDataToMessage, (message) => {
            const room = this.rooms.get(message.code);

            if (room) {
                const recipient = room.remotes.get(message.recipientid);

                if (recipient) {
                    recipient.send(
                        new ReliablePacket(recipient.nonce, [
                            new GameDataToMessage(
                                message.code,
                                recipient.clientid,
                                message._children
                            ),
                        ])
                    );
                }
            }
        });

        this.decoder.on(
            ReliablePacket,
            (message, direction, sender: dgram.RemoteInfo) => {
                const client = this.getOrCreateClient(sender);

                client.packets_recv.unshift(message.nonce);
                client.packets_recv.splice(8);

                client.ack(message.nonce);
            }
        );

        this.decoder.on(
            HelloPacket,
            (message, direction, sender: dgram.RemoteInfo) => {
                const client = this.getOrCreateClient(sender);

                client.packets_recv.unshift(message.nonce);
                client.packets_recv.splice(8);

                client.ack(message.nonce);

                client.identified = true;
                client.username = message.username;
                client.version = message.clientver;
            }
        );

        this.decoder.on(
            PingPacket,
            (message, direction, sender: dgram.RemoteInfo) => {
                const client = this.getOrCreateClient(sender);

                client.packets_recv.unshift(message.nonce);
                client.packets_recv.splice(8);

                client.ack(message.nonce);
            }
        );

        this.decoder.on(
            DisconnectPacket,
            (message, direction, sender: dgram.RemoteInfo) => {
                const client = this.getOrCreateClient(sender);

                if (!client.disconnected) client.disconnect();

                this.remotes.delete(ritoa(client.remote));
            }
        );

        this.decoder.on(
            AcknowledgePacket,
            (message, direction, sender: dgram.RemoteInfo) => {
                const client = this.getOrCreateClient(sender);

                const sent = client.packets_sent.find(
                    (s) => s.nonce === message.nonce
                );
                if (sent) sent.ackd = true;

                for (const missing of message.missingPackets) {
                    client.ack(client.packets_recv[missing]);
                }
            }
        );
    }

    private inc_clientid() {
        this._inc_clientid++;

        return this._inc_clientid;
    }

    async listen() {
        return new Promise<void>((resolve) => {
            this.socket.bind(this.config.port, this.config.host, () => {
                this.socket.on("message", this.onMessage.bind(this));

                resolve();
            });
        });
    }

    getOrCreateClient(remote: dgram.RemoteInfo) {
        const rc = `${remote.address}:${remote.port}`;
        const found = this.remotes.get(rc);

        if (found) {
            return found;
        }

        const client = new RemoteClient(this, remote, this.inc_clientid());
        this.remotes.set(rc, client);
        return client;
    }

    private _send(remote: dgram.RemoteInfo, buffer: Buffer) {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject("Socket not initialised.");
            }

            this.socket.send(
                buffer,
                remote.port,
                remote.address,
                (err, written) => {
                    if (err) return reject(err);

                    resolve(written);
                }
            );
        });
    }

    /**
     * Send a packet to the connected server.
     */
    async send(client: RemoteClient, packet: BaseRootPacket): Promise<void> {
        if (!this.socket) {
            return null;
        }

        if (
            packet.tag === SendOption.Reliable ||
            packet.tag === SendOption.Hello ||
            packet.tag === SendOption.Ping
        ) {
            const writer = HazelWriter.alloc(512);
            writer.uint8(packet.tag);
            writer.write(packet, MessageDirection.Clientbound, this.decoder);
            writer.realloc(writer.cursor);

            await this._send(client.remote, writer.buffer);

            if ((packet as any).nonce !== undefined) {
                const sent = {
                    nonce: (packet as any).nonce,
                    ackd: false,
                };

                client.packets_sent.unshift(sent);
                client.packets_sent.splice(8);

                let attempts = 0;
                const interval = setInterval(async () => {
                    if (sent.ackd) {
                        return clearInterval(interval);
                    } else {
                        if (
                            !client.packets_sent.find(
                                (packet) => sent.nonce === packet.nonce
                            )
                        ) {
                            return clearInterval(interval);
                        }

                        if (++attempts > 8) {
                            await client.disconnect();
                            clearInterval(interval);
                        }

                        if (
                            (await this._send(client.remote, writer.buffer)) ===
                            null
                        ) {
                            await client.disconnect();
                        }
                    }
                }, 1500);
            }
        } else {
            const writer = HazelWriter.alloc(512);
            writer.uint8(packet.tag);
            writer.write(packet, MessageDirection.Serverbound, this.decoder);
            writer.realloc(writer.cursor);

            await this._send(client.remote, writer.buffer);
        }
    }

    generateUniqueCode() {
        let code = V2Gen();
        while (this.rooms.has(code)) code = V2Gen();
        return code;
    }

    async onMessage(buffer: Buffer, remote: dgram.RemoteInfo) {
        const reader = HazelReader.from(buffer);
        this.decoder.write(reader, MessageDirection.Serverbound, remote);
    }
}
