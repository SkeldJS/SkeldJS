import dgram from "dgram";
import dns from "dns";
import util from "util";

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
    QuickChatMode,
} from "@skeldjs/constant";

import { EventContext } from "@skeldjs/events";

import { DisconnectMessages, MatchmakingServers } from "@skeldjs/data";

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
    GetGameListV2PayloadClientbound,
} from "@skeldjs/protocol";

import { Hostable, HostableEvents, PlayerData, RoomID } from "@skeldjs/core";

import {
    Code2Int,
    HazelBuffer,
    sleep,
    unary,
    EncodeVersion,
    createMissingBitfield,
    getMissing,
    SentPacket,
} from "@skeldjs/util";

import { ClientConfig, DebugLevel } from "./interface/ClientConfig";
import { GameListing } from "./GameListing";

const lookupDns = util.promisify(dns.lookup);

type PacketFilter = (packet: ClientboundPacket) => boolean;
type PayloadFilter = (payload: PayloadMessageClientbound) => boolean;

const ServerCertificate = `
-----BEGIN CERTIFICATE-----
MIIDbTCCAlWgAwIBAgIUf8xD1G/d5NK1MTjQAYGqd1AmBvcwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAgFw0yMTAyMDIxNzE4MDFaGA8yMjk0
MTExODE3MTgwMVowRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUx
ITAfBgNVBAoMGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAL7GFDbZdXwPYXeHWRi2GfAXkaLCgxuSADfa1pI2
vJkvgMTK1miSt3jNSg/o6VsjSOSL461nYmGCF6Ho3fMhnefOhKaaWu0VxF0GR1bd
e836YWzhWINQRwmoVD/Wx1NUjLRlTa8g/W3eE5NZFkWI70VOPRJpR9SqjNHwtPbm
Ki41PVgJIc3m/7cKOEMrMYNYoc6E9ehwLdJLQ5olJXnMoGjHo2d59hC8KW2V1dY9
sacNPUjbFZRWeQ0eJ7kbn8m3a5EuF34VEC7DFcP4NCWWI7HO5/KYE+mUNn0qxgua
r32qFnoaKZr9dXWRWJSm2XecBgqQmeF/90gdbohNNHGC/iMCAwEAAaNTMFEwHQYD
VR0OBBYEFAJAdUS5AZE3U3SPQoG06Ahq3wBbMB8GA1UdIwQYMBaAFAJAdUS5AZE3
U3SPQoG06Ahq3wBbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEB
ALUoaAEuJf4kQ1bYVA2ax2QipkUM8PL9zoNiDjUw6ZlwMFi++XCQm8XDap45aaeZ
MnXGBqIBWElezoH6BNSbdGwci/ZhxXHG/qdHm7zfCTNaLBe2+sZkGic1x6bZPFtK
ZUjGy7LmxsXOxqGMgPhAV4JbN1+LTmOkOutfHiXKe4Z1zu09mOo9sWfGCkbIyERX
QQILBYSIkg3hU4R4xMOjvxcDrOZja6fSNyi2sgidTfe5OCKC2ovU7OmsQqzb7mFv
e+7kpIUp6AZNc49n6GWtGeOoL7JUAqMOIO+R++YQN7/dgaGDPuu0PpmgI2gPLNW1
ZwHJ755zQQRX528xg9vfykY=
-----END CERTIFICATE-----` as const;

export interface SkeldjsClientEvents extends HostableEvents {
    /**
     * Emitted when the client gets disconnected.
     */
    "client.disconnect": {
        /**
         * The reason for why the client was disconnected.
         */
        reason: DisconnectReason;
        /**
         * A message provided if the disconnect reason was custom.
         */
        message: string;
    };
    /**
     * Emitted when a client receives a packet.
     */
    "client.packet": {
        /**
         * The packet that was received.
         */
        packet: ClientboundPacket;
    };
}

/**
 * Represents a programmable Among Us client.
 *
 * See {@link SkeldjsClientEvents} for events to listen to.
 */
export class SkeldjsClient extends Hostable<SkeldjsClientEvents> {
    /**
     * The options for the client.
     */
    options: ClientConfig;

    auth: any;

    /**
     * The datagram socket for the client.
     */
    socket: dgram.Socket;

    /**
     * The IP of the server that the client is currently connected to.
     */
    ip: string;

    /**
     * The port of the server that the client is currently connected to.
     */
    port: number;

    /**
     * An array of 8 of the most recent packets received from the server.
     */
    packets_recv: number[];

    /**
     * An array of 8 of the most recent packet sent by the client.
     */
    packets_sent: SentPacket[];

    private _nonce = 0;

    /**
     * Whether or not the client is currently connected to a server.
     */
    connected: boolean;

    /**
     * Whether or not the client has sent a disconnect packet.
     */
    sent_disconnect: boolean;

    /**
     * Whether or not the client is identified with the connected server.
     */
    identified: boolean;

    /**
     * The username of the client.
     */
    username: string;

    /**
     * The version of the client.
     */
    version: number;

    /**
     * The client ID of the client.
     */
    clientid: number;

    private token: number;
    private settings_cache: GameOptions;

    /**
     * The client message stream to the server sent every fixed update.
     */
    stream: GameDataMessage[];

    /**
     * Create a new Skeldjs client instance.
     * @param version The version of the client.
     * @param options Additional client options.
     * @example
     *```typescript
     * const client = new SkeldjsClient("2021.3.5.0");
     * ```
     */
    constructor(
        version: string | number,
        options: ClientConfig = { debug: DebugLevel.None, allowHost: true }
    ) {
        super({ doFixedUpdate: true });

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
        return this.hostid === this.clientid && this.options.allowHost;
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
                                    await this.handleJoin(payload.clientid);
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
                            await this.handleJoin(payload.clientid);
                            for (let i = 0; i < payload.clients.length; i++) {
                                await this.handleJoin(payload.clients[i]);
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

    /**
     * Connect to a region or IP. Optionally identify with a username (can be done later with the {@link SkeldjsClient.identify} method).
     * @param host The hostname to connect to.
     * @param username The username to identify with
     * @param token The authorisation token. Currently unavailable, working on account system.
     * @param port The port to connect to.
     * @param pem The public certificate of the server.
     * @example
     *```typescript
     * // Connect to an official Among Us region.
     * await connect("NA", "weakeyes", 432432);
     *
     * // Connect to a locally hosted private server.
     * await connect("127.0.0.1", "weakeyes", 3423432);
     * ```
     */
    async connect(host: "NA" | "EU" | "AS", username?: string, token?: number, port?: number, pem?: string);
    async connect(host: string, username?: string, token?: number, port?: number, pem?: string);
    async connect(
        host: string,
        username?: string,
        token?: number,
        port: number = 22023,
        pem = ServerCertificate
    ) {
        await this.disconnect();

        if (host in MatchmakingServers) {
            return await this.connect(
                MatchmakingServers[host][0],
                username,
                token,
                22023,
                pem
            );
        }

        const ip = await lookupDns(host);

        this.ip = ip.address;
        this.port = port;

        this.socket = dgram.createSocket("udp4");
        this.connected = true;

        this.socket.on("message", this.onMessage.bind(this));
/*
        const certificate = Buffer.from(pem.trim());

        this.auth = dtls.connect({
            type: "udp4",
            remotePort: 22025,
            remoteAddress: ip.address,
            cipherSuites: ["TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"],
            extendedMasterSecret: false,
        });

        this.auth.on("error", () => {
            console.log("error");
        });

        this.auth.on("connect", () => {
            const writer = HazelBuffer.alloc(6);
            writer
                .uint8(1)
                .uint16LE(6)
                .int32(this.version)
                .uint8(Platform.Itch)
                .string("");

            this.auth.write(writer.buffer);
        });

        this.auth.on("data", (message) => {
            console.log("Got a message!!", message);
        });*/

        if (typeof username === "string") {
            await this.identify(username, token);
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

    /**
     * Disconnect from the server currently connected to.
     */
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

                await Promise.race([
                    this.wait("client.disconnect"),
                    sleep(6000),
                ]);
            } else if (this.sent_disconnect) {
                this.emit("client.disconnect", {
                    reason,
                    message: message || DisconnectMessages[reason],
                });

                this._reset();
            }
        }
    }

    /**
     * Identify with the connected server. (Can be done before in the {@link SkeldjsClient.connect} method)
     * @param username The username to identify with.
     * @example
     *```typescript
     * await client.identify("weakeyes");
     * ```
     */
    async identify(username: string, token: number) {
        await this.send({
            op: Opcode.Hello,
            hazelver: 0,
            clientver: this.version,
            username,
            token
        });

        this.identified = true;
        this.username = username;
        this.token = token;
    }

    waitPacket(
        filter: PacketFilter | PacketFilter[]
    ): Promise<ClientboundPacket> {
        return new Promise((resolve, reject) => {
            const clearListeners = () => {
                this.off("client.packet", onPacket);
                this.off("client.disconnect", onDisconnect);
            };

            function onPacket(ev: EventContext<{ packet: ClientboundPacket }>) {
                if (Array.isArray(filter)) {
                    for (let i = 0; i < filter.length; i++) {
                        if (filter[i](ev.data.packet)) {
                            clearListeners();
                            resolve(ev.data.packet);
                        }
                    }
                } else {
                    if (filter(ev.data.packet)) {
                        clearListeners();
                        resolve(ev.data.packet);
                    }
                }
            }

            function onDisconnect(
                ev: EventContext<{ message: string; reason: number }>
            ) {
                clearListeners();
                reject(new Error(`${ev.data.reason} - ${ev.data.message}`));
            }

            this.on("client.packet", onPacket);
            this.once("client.disconnect", onDisconnect);
        });
    }

    /**
     * Wait to receive a payload message from the server with a specified filter.
     * @param filter Either a filter or an array of filters to match the payload to receive.
     * @returns The payload or payloads in question.
     */
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

    /**
     * Send a packet to the connected server.
     */
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

    /**
     * Broadcast a message to a specific player or to all players in the game.
     * @param messages The messages to broadcast.
     * @param reliable Whether or not the message should be acknowledged by the server.
     * @param recipient The optional recipient of the messages.
     * @param payload Additional payloads to be sent to the server. (Not necessarily broadcasted to all players, or even the recipient.)
     */
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

    /**
     * Spawn your own player if `doSpawn = false` was used in the {@link SkeldjsClient.joinGame} method.
     * @example
     * ```typescript
     * // Spawn your player 5 seconds after joining a game without spawning.
     * await client.joinGame("ABCDEF", false);
     *
     * setTimeout(() => {
     *   await client.spawnSelf();
     * }, 5000)
     * ```
     */
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
            await this.me.wait("player.spawn");
        }
    }

    /**
     * Join a room given the 4 or 6 digit code.
     * @param code The code of the room to join.
     * @param doSpawn Whether or not to spawn the player. If false, the client will be unaware of any existing objects in the game until {@link SkeldjsClient.spawnSelf} is called.
     * @returns The code of the room joined.
     * @example
     *```typescript
     * await client.joinGame("ABCDEF");
     * ```
     */
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
            const username = this.username;
            await this.disconnect();
            await this.connect(this.ip, username, this.token, this.port);
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
                await this.connect(payload.ip, username, this.token, payload.port);

                return await this.joinGame(code, doSpawn);
            case PayloadTag.JoinedGame:
                if (doSpawn) {
                    await this.spawnSelf();
                }

                return this.code;
        }
    }

    /**
     * Create a game with given settings.
     * @param host_settings The settings to create the game with.
     * @param doJoin Whether or not to join the game after created.
     * @returns The game code of the room.
     * @example
     *```typescript
     * // Create a game on The Skeld with an English chat with 2 impostors.
     * await client.createGame({
     *   map: MapID.TheSkeld,
     *   language: LanguageID.English,
     *   impostors: 2
     * });
     * ```
     */
    async createGame(
        host_settings: Partial<GameOptions> = {},
        doJoin: boolean = true,
        chatMode: QuickChatMode = QuickChatMode.FreeChat
    ): Promise<RoomID> {
        const settings = {
            ...SkeldjsClient.defaultGameOptions,
            ...host_settings,
        } as GameOptions;

        await this.send({
            op: Opcode.Reliable,
            payloads: [
                {
                    tag: PayloadTag.HostGame,
                    settings,
                    chatMode,
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
                await this.connect(payload.ip, username, this.token, payload.port);

                return await this.createGame(host_settings, doJoin);
            case PayloadTag.HostGame:
                this.settings_cache = settings;

                if (doJoin) {
                    await this.joinGame(payload.code);
                    return payload.code;
                } else {
                    return payload.code;
                }
        }
    }

    /**
     * Search for public games.
     * @param maps The maps of games to look for. If a number, it will be a bitfield of the maps, else, it will be an array of the maps.
     * @param impostors The number of impostors to look for. 0 for any amount.
     * @param language The language of the game to look for, {@link LanguageID.All} for any.
     * @returns An array of game listings with the data and a {@link GameListing.join} method to join the game.
     * @example
	 *```typescript
     * // Search for games and join a random one.
     * const client = new SkeldjsClient("2021.3.5.0");

     * await client.connect("EU", "weakeyes");

     * const games = await client.findGames();
     * const game = games[Math.floor(Math.random() * games.length)];

     * const code = await game.join();
     * ```
	 */
    async findGames(
        maps: number | MapID[] = 0x7 /* all maps */,
        impostors = 0 /* any impostors */,
        language = LanguageID.All
    ): Promise<GameListing[]> {
        if (Array.isArray(maps)) {
            return await this.findGames(
                maps.reduce(
                    (acc, cur) => acc | (1 << cur),
                    0
                ) /* convert to bitfield */,
                impostors,
                language
            );
        }

        const options = {
            ...SkeldjsClient.defaultGameOptions,
            map: maps,
            impostors: 0,
            language: LanguageID.English,
        } as GameOptions;

        await this.send({
            op: Opcode.Reliable,
            payloads: [
                {
                    tag: PayloadTag.GetGameListV2,
                    options,
                },
            ],
        });

        const payload = (await this.waitPayload([
            (payload) => payload.tag === PayloadTag.GetGameListV2,
        ])) as GetGameListV2PayloadClientbound;

        const games = payload.games.map(
            (game) =>
                new GameListing(
                    this,
                    game.ip,
                    game.port,
                    game.code,
                    game.name,
                    game.players,
                    game.age,
                    game.map,
                    game.impostors,
                    game.max_players
                )
        );

        return games;
    }

    static defaultGameOptions = {
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
    };
}
