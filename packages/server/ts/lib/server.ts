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
    PayloadMessageServerbound
} from "@skeldjs/protocol"

import {
    DisconnectReason,
    Opcode,
    PayloadTag
} from "@skeldjs/constant"

import { Room } from "@skeldjs/common"

import {
    HazelBuffer,
    V2Gen,
    ritoa,
    getMissing,
} from "@skeldjs/util"

import { RemoteClient } from "./RemoteClient";

type PacketFilter = (packet: ServerboundPacket) => boolean;
type PayloadFilter = (payload: PayloadMessageServerbound) => boolean;

export interface SkeldjsServer {
        }

const default_config = (): ServerConfig => ({
    versions: ["2020.11.17"],
    port: 22023,
    host: "0.0.0.0"
});

export class SkeldjsServer extends EventEmitter {
    config: ServerConfig;

    publicip: string;
    
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

        this.socket = dgram.createSocket("udp4");
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

    getClient(remote: dgram.RemoteInfo) {
        const rc = `${remote.address}:${remote.port}`;
        const client = this.remotes.get(rc);

        if (client) {
            return client;
        }

        this.remotes.set(rc, new RemoteClient(this, remote, this.inc_clientid()));
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

    async send(client: RemoteClient, packet: ClientboundPacket, waitAck = true) {
        if (packet.op === Opcode.Reliable || packet.op === Opcode.Hello || packet.op === Opcode.Ping) {
            packet.nonce = client.nonce;

            const { buffer } = composePacket(packet, "client") as HazelBuffer;

            const written = await this._send(client.remote, buffer);

            client.packets_sent.push({
                nonce: packet.nonce,
                ackd: false
            });
            client.packets_sent.splice(8);

            if (waitAck) {
                let attempts = 0;

                const interval = setInterval(async () => {
                    if (++attempts > 8) {
                        await client.disconnect();
                    }

                    await this._send(client.remote, buffer);
                }, 1500);

                await this.waitPacket(client, packet => packet.op === Opcode.Acknowledge && packet.nonce === packet.nonce);

                clearInterval(interval);
            }

            return written;
        } else {
            const { buffer } = composePacket(packet, "client");

            return this._send(client.remote, buffer);
        }
    }

    async sendPayload(client: RemoteClient, reliable: boolean, ...payloads: PayloadMessageClientbound[]) {
        return await this.send(client, {
            op: reliable ? Opcode.Reliable : Opcode.Unreliable,
            payloads: payloads
        });
    }

    async onMessage(message: Buffer, remote: dgram.RemoteInfo) {
        const client = this.getClient(remote);

        const packet = parsePacket(message, "server");

        switch (packet.op) {
            case Opcode.Reliable:
            case Opcode.Hello:
            case Opcode.Ping:
                client.packets_recv.push(packet.nonce);
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
                            let code = V2Gen();
                            while (!this.rooms.has(code)) code = V2Gen();

                            await this.sendPayload(client, true, {
                                tag: PayloadTag.HostGame,
                                code
                            });
                            break;
                        case PayloadTag.JoinGame:
                            const room = this.rooms.get(payload.code);
                            room;
                            break;
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
                missing.forEach(client.ack);
                break;
            case Opcode.Ping:
                break;
        }
    }
}