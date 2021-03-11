import dgram from "dgram";

import {
    DisconnectReason,
    DistanceID,
    LanguageID,
    MessageTag,
    Opcode,
    PayloadTag,
    TaskBarUpdate,
    MapID,
    SpawnID,
} from "@skeldjs/constant";

import { DisconnectMessages } from "@skeldjs/data";

import {
    ClientboundPacket,
    ServerboundPacket,
    HostGamePayloadClientbound,
    JoinGamePayloadClientboundError,
    JoinedGamePayload,
    PayloadMessage,
    PayloadMessageClientbound,
    RedirectPayload,
    GameDataMessage,
    GameOptions,
    composePacket,
    parsePacket,
    GameDataToPayload,
    GameDataPayload,
    PayloadMessageServerbound,
} from "@skeldjs/protocol";

import { Hostable, HostableEvents, PlayerData, RoomID } from "@skeldjs/core";

import {
    Code2Int,
    Int2Code,
    HazelBuffer,
    sleep,
    unary,
    EncodeVersion,
    createMissingBitfield,
    getMissing,
    SentPacket,
} from "@skeldjs/util";

import { ClientConfig, DebugLevel } from "./interface/ClientConfig";
import { EventContext } from "../../../core/node_modules/@skeldjs/events/js";

type PacketFilter = (packet: ClientboundPacket) => boolean;
type PayloadFilter = (payload: PayloadMessageClientbound) => boolean;

export type SkeldjsClientEvents = HostableEvents & {
    "client.disconnect": {
        reason: DisconnectReason;
        message: string;
    };
    "client.packet": {
        packet: ClientboundPacket;
    };
};

export class SkeldjsClient extends Hostable<SkeldjsClientEvents> {
    options: ClientConfig;

    socket: dgram.Socket;
    ip: string;
    port: number;

    packets_recv: number[];
    packets_sent: SentPacket[];
    private _nonce = 0;

    connected: boolean;
    sent_disconnect: boolean;
    identified: boolean;
    username: string;
    version: number;

    clientid: number;

    private settings_cache: GameOptions;
    stream: GameDataMessage[];

    constructor(
        version: string | number,
        options: ClientConfig = { debug: DebugLevel.None, allowHost: true }
    ) {
        super();

        this.options = options;

        if (typeof version === "number") {
            this.version = version;
        } else {
            const [year, month, day, revision] = version
                .split(".")
                .map(unary(parseInt));
            this.version = EncodeVersion(year, month, day, revision);
        }

        this.packets_recv = [];
        this.packets_sent = [];

        this._reset();

        this.stream = [];
    }

    get nonce() {
        this._nonce++;

        return this._nonce;
    }

    get me() {
        return this.players.get(this.clientid);
    }

    get amhost() {
        return this.hostid === this.clientid;
    }

    private debug(level: number, ...fmt: any[]) {
        if (this.options.debug & level) {
            return fmt;
        }
    }

    private async ack(nonce: number) {
        await this.send({
            op: Opcode.Acknowledge,
            nonce: nonce,
            missingPackets: createMissingBitfield(this.packets_sent),
        });
    }

    async handlePacket(packet: ClientboundPacket) {
        this.emit("client.packet", { packet });

        switch (packet.op) {
            case Opcode.Reliable:
            case Opcode.Hello:
            case Opcode.Ping:
                this.packets_recv.unshift(packet.nonce);
                this.packets_recv.splice(8);

                this.ack(packet.nonce);
                break;
            case Opcode.Disconnect:
                await this.disconnect(packet.reason, packet.message);
                break;
            case Opcode.Acknowledge:
                const sent = this.packets_sent.find(
                    (s) => s.nonce === packet.nonce
                );
                if (sent) sent.ackd = true;

                const missing = getMissing(
                    this.packets_recv,
                    packet.missingPackets
                );
                missing.forEach(this.ack.bind(this));
                break;
        }

        switch (packet.op) {
            case Opcode.Unreliable:
            case Opcode.Reliable:
                for (let i = 0; i < packet.payloads.length; i++) {
                    const payload = packet.payloads[i];

                    switch (payload.tag) {
                        case PayloadTag.HostGame:
                            this.setCode(payload.code);
                            break;
                        case PayloadTag.JoinGame:
                            if (payload.error === false) {
                                if (this.me && this.code === payload.code) {
                                    this.handleJoin(payload.clientid);
                                    this.setHost(payload.hostid);
                                }
                            }
                            break;
                        case PayloadTag.StartGame:
                            if (this.me && this.code === payload.code) {
                                await this.handleStart();
                            }
                            break;
                        case PayloadTag.EndGame:
                            if (this.me && this.code === payload.code) {
                                await this.handleEnd(payload.reason);
                            }
                            break;
                        case PayloadTag.RemovePlayer:
                            if (this.me && this.code === payload.code) {
                                this.handleLeave(payload.clientid);
                                this.setHost(payload.hostid);
                            }
                            break;
                        case PayloadTag.GameData:
                        case PayloadTag.GameDataTo:
                            if (this.me && this.code === payload.code) {
                                for (
                                    let i = 0;
                                    i < payload.messages.length;
                                    i++
                                ) {
                                    const message = payload.messages[i];

                                    this.handleGameData(message);
                                }
                            }
                            break;
                        case PayloadTag.JoinedGame:
                            this.clientid = payload.clientid;
                            this.setCode(payload.code);
                            this.setHost(payload.hostid);
                            this.handleJoin(payload.clientid);
                            for (let i = 0; i < payload.clients.length; i++) {
                                this.handleJoin(payload.clients[i]);
                            }
                            break;
                        case PayloadTag.AlterGame:
                            this._setAlterGameTag(
                                payload.alter_tag,
                                payload.value
                            );
                            break;
                    }
                }
                break;
        }
    }

    async onMessage(message: Buffer) {
        const packet = parsePacket(message, "client");
        this.handlePacket(packet);
    }

    async connect(ip: string, port: number, username?: string) {
        await this.disconnect();

        this.ip = ip;
        this.port = port;

        this.socket = dgram.createSocket("udp4");
        this.connected = true;

        this.socket.on("message", this.onMessage.bind(this));

        if (typeof username === "string") {
            await this.identify(username);
        }
    }

    private _reset() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }

        this.ip = null;
        this.port = null;
        this.socket = null;
        this.sent_disconnect = false;
        this.connected = false;
        this.identified = false;
        this.username = null;

        this.packets_sent = [];
        this.packets_recv = [];
    }

    async disconnect(reason?: DisconnectReason, message?: string) {
        if (this.connected) {
            if (this.identified && !this.sent_disconnect) {
                await this.send({
                    op: Opcode.Disconnect,
                    reason,
                    message,
                    show_reason: true,
                });

                this.sent_disconnect = true;

                await Promise.race([this.wait("client.disconnect"), sleep(6000)]);
            } else if (this.sent_disconnect) {
                this.emit("client.disconnect", {
                    reason,
                    message: message || DisconnectMessages[reason],
                });

                this._reset();
            }
        }
    }

    async identify(username: string) {
        await this.send({
            op: Opcode.Hello,
            hazelver: 0,
            clientver: this.version,
            username: username,
        });

        this.identified = true;
        this.username = username;
    }

    waitPacket(
        filter: PacketFilter | PacketFilter[]
    ): Promise<ClientboundPacket> {
        return new Promise((resolve, reject) => {
            const clearListeners = () => {
                this.off("client.packet", onPacket);
                this.off("client.disconnect", onDisconnect);
            };

            function onPacket(ev: EventContext, { packet }: { packet: ClientboundPacket }) {
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

            function onDisconnect(ev: EventContext, { message, reason } : { message: string, reason: number }) {
                clearListeners();
                reject(new Error(`${reason} - ${message}`));
            }

            this.on("client.packet", onPacket);
            this.once("client.disconnect", onDisconnect);
        });
    }

    async waitPayload(
        filter: PayloadFilter | PayloadFilter[]
    ): Promise<PayloadMessage> {
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
            return (
                (packet.op === Opcode.Unreliable ||
                    packet.op === Opcode.Reliable) &&
                packet.payloads.some(findPayload)
            );
        }

        const packet = (await this.waitPacket(onPacket)) as any; // Fixes typings...................

        return packet.payloads.find(findPayload);
    }

    private _send(buffer: Buffer): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                resolve(null);
            }

            this.socket.send(buffer, this.port, this.ip, (err, written) => {
                if (err) return reject(err);

                resolve(written);
            });
        });
    }

    async send(packet: ServerboundPacket): Promise<void> {
        if (!this.socket) {
            return null;
        }

        if (
            packet.op === Opcode.Reliable ||
            packet.op === Opcode.Hello ||
            packet.op === Opcode.Ping
        ) {
            packet.nonce = this.nonce;

            const { buffer } = composePacket(packet, "server") as HazelBuffer;

            await this._send(buffer);

            const sent = {
                nonce: packet.nonce,
                ackd: false,
            };

            this.packets_sent.unshift(sent);
            this.packets_sent.splice(8);

            let attempts = 0;
            const interval = setInterval(async () => {
                if (sent.ackd) {
                    return clearInterval(interval);
                } else {
                    if (
                        !this.packets_sent.find(
                            (packet) => sent.nonce === packet.nonce
                        )
                    ) {
                        return clearInterval(interval);
                    }

                    if (++attempts > 8) {
                        await this.disconnect();
                        clearInterval(interval);
                        return this.emit(
                            "error",
                            new Error(
                                "Server failed to acknowledge packet 8 times."
                            )
                        );
                    }

                    if ((await this._send(buffer)) === null) {
                        await this.disconnect();
                        clearInterval(interval);
                        this.emit(
                            "error",
                            new Error("Could not send message.")
                        );
                    }
                }
            }, 1500);
        } else {
            const { buffer } = composePacket(packet, "server");

            await this._send(buffer);
        }
    }

    async broadcast(
        messages: GameDataMessage[],
        reliable = true,
        recipient: PlayerData = null,
        payloads: PayloadMessageServerbound[] = []
    ) {
        if (recipient) {
            await this.send({
                op: reliable ? Opcode.Reliable : Opcode.Unreliable,
                payloads: [
                    ...(messages.length
                        ? [
                              {
                                  tag: PayloadTag.GameDataTo,
                                  code: this.code,
                                  recipientid: recipient.id,
                                  messages,
                              } as GameDataToPayload,
                          ]
                        : []),
                    ...payloads,
                ],
            });
        } else {
            await this.send({
                op: reliable ? Opcode.Reliable : Opcode.Unreliable,
                payloads: [
                    ...(messages.length
                        ? [
                              {
                                  tag: PayloadTag.GameData,
                                  code: this.code,
                                  messages,
                              } as GameDataPayload,
                          ]
                        : []),
                    ...payloads,
                ],
            });
        }
    }

    async spawnSelf() {
        if (!this.me || this.me.inScene) {
            return;
        }

        if (this.amhost) {
            this.spawnPrefab(SpawnID.Player, this.me);
            this.setSettings(this.settings_cache);
        } else {
            await this.send({
                op: Opcode.Reliable,
                payloads: [
                    {
                        tag: PayloadTag.GameData,
                        code: this.code,
                        messages: [
                            {
                                tag: MessageTag.SceneChange,
                                clientid: this.clientid,
                                scene: "OnlineGame",
                            },
                        ],
                    },
                ],
            });
        }
    }

    async joinGame(code: RoomID, doSpawn: boolean = true): Promise<RoomID> {
        if (typeof code === "undefined") {
            throw new Error("No code provided.");
        }

        if (typeof code === "string") {
            return this.joinGame(Code2Int(code), doSpawn);
        }

        if (!this.identified) {
            return null;
        }

        if (this.me && this.code !== code) {
            await this.disconnect();
            await this.connect(this.ip, this.port);
            await this.identify(this.username);
        }

        await this.send({
            op: Opcode.Reliable,
            payloads: [
                {
                    code,
                    tag: PayloadTag.JoinGame,
                    mapOwnership: 0x7, // All maps
                },
            ],
        });

        const payload = (await this.waitPayload([
            (payload) => payload.tag === PayloadTag.JoinGame && payload.error,
            (payload) => payload.tag === PayloadTag.Redirect,
            (payload) => payload.tag === PayloadTag.JoinedGame,
        ])) as
            | JoinGamePayloadClientboundError
            | RedirectPayload
            | JoinedGamePayload;

        switch (payload.tag) {
            case PayloadTag.JoinGame:
                throw new Error(
                    "Join error: Failed to join game, code: " +
                        payload.reason +
                        " (Message: " +
                        DisconnectMessages[payload.reason] +
                        ")"
                );
            case PayloadTag.Redirect:
                const username = this.username;

                await this.disconnect();
                await this.connect(payload.ip, payload.port);
                await this.identify(username);

                return await this.joinGame(code, doSpawn);
            case PayloadTag.JoinedGame:
                if (doSpawn) {
                    await this.spawnSelf();
                }

                return this.code;
        }
    }

    async createGame(
        host_settings: Partial<GameOptions> = {},
        doJoin: boolean = true
    ): Promise<string> {
        const settings = {
            version: 4,
            players: 10,
            language: LanguageID.Other,
            map: MapID.TheSkeld,
            playerSpeed: 1,
            crewmateVision: 1,
            impostorVision: 1.5,
            killCooldown: 45,
            commonTasks: 1,
            longTasks: 1,
            shortTasks: 2,
            emergencies: 1,
            impostors: 3,
            killDistance: DistanceID.Medium,
            discussionTime: 15,
            votingTime: 120,
            isDefaults: false,
            emergencyCooldown: 15,
            confirmEjects: true,
            visualTasks: true,
            anonymousVotes: false,
            taskbarUpdates: TaskBarUpdate.Always,
            ...host_settings,
        } as GameOptions;

        await this.send({
            op: Opcode.Reliable,
            payloads: [
                {
                    tag: PayloadTag.HostGame,
                    settings,
                },
            ],
        });

        const payload = (await this.waitPayload([
            (payload) => payload.tag === PayloadTag.JoinGame && payload.error,
            (payload) => payload.tag === PayloadTag.Redirect,
            (payload) => payload.tag === PayloadTag.HostGame,
        ])) as
            | JoinGamePayloadClientboundError
            | RedirectPayload
            | HostGamePayloadClientbound;

        switch (payload.tag) {
            case PayloadTag.JoinGame:
                throw new Error(
                    "Join error: Failed to create game, code: " +
                        payload.reason +
                        " (Message: " +
                        DisconnectMessages[payload.reason] +
                        ")"
                );
            case PayloadTag.Redirect:
                const username = this.username;

                await this.disconnect();
                await this.connect(payload.ip, payload.port);
                await this.identify(username);

                return await this.createGame(host_settings, doJoin);
            case PayloadTag.HostGame:
                this.settings_cache = settings;

                if (doJoin) {
                    await this.joinGame(payload.code);
                    return Int2Code(payload.code);
                } else {
                    return Int2Code(payload.code);
                }
        }
    }
}
