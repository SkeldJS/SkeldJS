import { EventEmitter } from "events"
import dgram from "dgram"

import { ServerConfig } from "./interface/ServerConfig"

import {
    parsePacket,
    composePacket,
    ClientboundPacket,
    ServerboundPacket,
    PayloadMessage,
    PayloadMessageClientbound,
    PayloadMessageServerbound,
    HostGamePayloadServerbound,
    JoinGamePayloadServerbound
} from "@skeldjs/protocol"

import {
    DisconnectReason,
    Opcode,
    PayloadTag
} from "@skeldjs/constant"

import {
    HazelBuffer,
    V2Gen,
    ritoa,
    getMissing,
    sleep
} from "@skeldjs/util"

import { RemoteClient } from "./RemoteClient";

import { Room } from "./Room";
import { AlterGameTag } from "@skeldjs/core"
import { SpecialID } from "./constants/IDs"

type PacketFilter = (packet: ServerboundPacket) => boolean;
type PayloadFilter = (payload: PayloadMessageServerbound) => boolean;

export interface SkeldjsServer {}

const default_config = (): ServerConfig => ({
    versions: ["2020.11.17"],
    port: 22023,
    host: "0.0.0.0"
});

export class SkeldjsServer extends EventEmitter {
    config: ServerConfig;

    socket: dgram.Socket;

    remotes: Map<string, RemoteClient>;
    rooms: Map<number, Room>;

    private _inc_clientid;

    constructor(config?: Partial<ServerConfig>) {
        super();

        this.config = {
            ...default_config(),
            ...config
        };
        this._inc_clientid = 0;

        this.socket = dgram.createSocket("udp4");

        this.remotes = new Map;
        this.rooms = new Map;
    }

    private inc_clientid() {
        this._inc_clientid++;

        return this._inc_clientid;
    }

    async listen() {
        return new Promise<void>(resolve => {
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

    waitPacket(from: RemoteClient, filter: PacketFilter|PacketFilter[]): Promise<ServerboundPacket> {
        return new Promise(resolve => {
            const clearListeners = () => {
                this.off("packet", onPacket);
                this.off("disconnect", onDisconnect);
            }

            function onPacket(client: RemoteClient, packet: ServerboundPacket) {
                if (client !== from) return;

                if (Array.isArray(filter)) {
                    for (let i = 0; i < filter.length; i++) {
                        if (filter[i](packet)) {
                            clearListeners();
                            resolve(packet);
                        }
                    }
                } else {
                    if (filter(packet)) {
                        clearListeners();
                        resolve(packet);
                    }
                }
            }

            function onDisconnect(client: RemoteClient) {
                if (client !== from) return;

                clearListeners();
                resolve(null);
            }

            this.on("packet",  onPacket);
            this.on("disconnect", onDisconnect);
        });
    }

    async waitPayload(from: RemoteClient, filter: PayloadFilter|PayloadFilter[]): Promise<PayloadMessage> {
        function findPayload(payload) {
            if (Array.isArray(filter)) {
                for (let i = 0; i < filter.length; i++) {
                    if (filter[i](payload)) {
                        return true;
                    }
                }
            } else {
                return filter(payload);
            }
        }

        function onPacket(packet) {
            return (packet.op === Opcode.Unreliable || packet.op === Opcode.Reliable) &&
                packet.payloads.some(findPayload);
        }

        const packet = await this.waitPacket(from, onPacket) as any; // Fixes typings...................

        return packet.payloads.find(findPayload);
    }

    private _send(remote: dgram.RemoteInfo, buffer: Buffer) {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject("Socket not initialised.");
            }

            this.socket.send(buffer, remote.port, remote.address, (err, written) => {
                if (err) return reject(err);

                resolve(written);
            });
        });
    }

    async send(client: RemoteClient, packet: ClientboundPacket) {
        if (packet.op === Opcode.Reliable || packet.op === Opcode.Hello || packet.op === Opcode.Ping) {
            packet.nonce = client.nonce;
            client.nonce++;

            const { buffer } = composePacket(packet, "client") as HazelBuffer;

            await this._send(client.remote, buffer);

            const sent = {
                nonce: packet.nonce,
                ackd: false
            }

            client.packets_sent.unshift(sent);
            client.packets_sent.splice(8);

            let attempts = 0;
            const interval = setInterval(async () => {
                if (sent.ackd) {
                    return clearInterval(interval);
                } else {
                    if (!client.packets_sent.find(packet => sent.nonce === packet.nonce)) {
                        return clearInterval(interval);
                    }

                    if (++attempts > 8) {
                        await client.disconnect();
                        clearInterval(interval);
                        return;
                    }

                    if (await this._send(client.remote, buffer) === null) {
                        await client.disconnect();
                        clearInterval(interval);
                        return;
                    }
                }
            }, 1500);
        } else {
            const { buffer } = composePacket(packet, "client");

            await this._send(client.remote, buffer);
        }
    }

    async sendPayload(client: RemoteClient, reliable: boolean, ...payloads: PayloadMessageClientbound[]) {
        await this.send(client, {
            op: reliable ? Opcode.Reliable : Opcode.Unreliable,
            payloads: payloads
        });
    }

    generateUniqueCode() {
        let code = V2Gen();
        while (this.rooms.has(code)) code = V2Gen();
        return code;
    }

    async handleHostGame(payload: HostGamePayloadServerbound, client: RemoteClient) {
        const code = this.generateUniqueCode();
        const room = new Room(this, { SaaH: true });
        room.setHost(SpecialID.SaaH);
        room.code = code;
        this.rooms.set(code, room);

        room.settings = payload.settings

        await this.sendPayload(client, true, {
            tag: PayloadTag.HostGame,
            code
        });
    }

    async handleJoinGame(payload: JoinGamePayloadServerbound, client: RemoteClient) {
        const room = this.rooms.get(payload.code);
        if (client.room) {
            return await client.joinError(DisconnectReason.Custom, "Already in game, please leave your current one before joining a new one.");
        }

        if (!room)
            return await client.joinError(DisconnectReason.GameNotFound);

        if (room.players.size >= room.settings.players)
            return await client.joinError(DisconnectReason.GameFull);

        const player = await room.handleJoin(client.clientid);
        room.remotes.set(client.clientid, client);
        client.room = room;
        if (!room.hostid)
            room.hostid = client.clientid;

        await this.sendPayload(client, true, {
            tag: PayloadTag.JoinedGame,
            code: room.code,
            clientid: client.clientid,
            hostid: room.hostid,
            clients: [...room.remotes.values()].filter(player => player.clientid !== client.clientid).map(player => player.clientid)
        }, {
            tag: PayloadTag.AlterGame,
            code: room.code,
            alter_tag: AlterGameTag.ChangePrivacy,
            value: room.privacy === "public" ? 1 : 0
        });

        await room.broadcast(null, true, null, [{
            tag: PayloadTag.JoinGame,
            error: false,
            code: room.code,
            clientid: client.clientid,
            hostid: room.hostid
        }]);

        if (room.options.SaaH) {
            await player.once("player.spawn");
            await Promise.race([Promise.all([player.once("player.setname"), player.once("player.setcolor")]), sleep(1000)]);
            for (const [ , remote ] of this.remotes) {
                this.sendPayload(remote, true, {
                    tag: PayloadTag.JoinGame,
                    error: false,
                    code: room.code,
                    clientid: SpecialID.Nil,
                    hostid: remote.clientid
                }, {
                    tag: PayloadTag.RemovePlayer,
                    code: room.code,
                    clientid: SpecialID.Nil,
                    hostid: remote.clientid,
                    reason: 0
                });
            }
        }
    }

    async onMessage(message: Buffer, remote: dgram.RemoteInfo) {
        const client = this.getOrCreateClient(remote);

        const packet = parsePacket(message, "server");

        switch (packet.op) {
            case Opcode.Reliable:
            case Opcode.Hello:
            case Opcode.Ping:
                client.packets_recv.unshift(packet.nonce);
                client.packets_recv.splice(8);

                client.ack(packet.nonce);
                break;
        }

        switch (packet.op) {
            case Opcode.Unreliable:
            case Opcode.Reliable:
                for (let i = 0; i < packet.payloads.length; i++) {
                    const payload = packet.payloads[i];

                    switch (payload.tag) {
                        case PayloadTag.HostGame:
                            await this.handleHostGame(payload, client);
                            break;
                        case PayloadTag.JoinGame:
                            await this.handleJoinGame(payload, client);
                            break;
                        case PayloadTag.GameData: {
                            const room = this.rooms.get(payload.code);
                            if (room) {
                                for (let i = 0; i < payload.messages.length; i++) {
                                    const message = payload.messages[i];
                                    await room.handleGameData(message);
                                }
                                for (const [ , remote ] of room.remotes) {
                                    if (remote.clientid === client.clientid)
                                        continue;

                                    await remote.send({
                                        op: Opcode.Reliable,
                                        payloads: [{
                                            tag: PayloadTag.GameData,
                                            code: room.code,
                                            messages: payload.messages
                                        }]
                                    });
                                }
                            }
                            break;
                        }
                        case PayloadTag.GameDataTo: {
                            const room = this.rooms.get(payload.code);
                            if (room) {
                                const recipient = room.remotes.get(payload.recipientid);
                                if (recipient) {
                                    await this.sendPayload(recipient, true, {
                                        tag: PayloadTag.GameDataTo,
                                        code: payload.code,
                                        recipientid: payload.recipientid,
                                        messages: payload.messages
                                    });
                                }
                            }
                            break;
                        }
                    }
                }
                break;
            case Opcode.Hello:
                client.identified = true;
                client.username = packet.username;
                client.version = packet.clientver;
                break;
            case Opcode.Disconnect:
                if (!client.disconnected)
                    client.disconnect();

                this.remotes.delete(ritoa(client.remote))
                break;
            case Opcode.Acknowledge:
                const sent = client.packets_sent.find(s => s.nonce === packet.nonce);
                if (sent) sent.ackd = true;

                const missing = getMissing(client.packets_recv, packet.missingPackets);
                missing.forEach(nonce => client.ack(nonce));
                break;
            case Opcode.Ping:
                break;
        }
    }
}
