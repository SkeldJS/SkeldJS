import dgram from "dgram";
import dns from "dns";
import util from "util";

import {
    DisconnectReason,
    QuickChatMode,
    SendOption,
    SpawnType,
    RootMessageTag,
    GameMap,
    GameKeyword,
} from "@skeldjs/constant";

import { DisconnectMessages, MatchmakingServers } from "@skeldjs/data";

import {
    AcknowledgePacket,
    BaseRootMessage,
    DisconnectPacket,
    GameOptions,
    HelloPacket,
    BaseGameDataMessage,
    GameDataToMessage,
    ReliablePacket,
    UnreliablePacket,
    GameDataMessage,
    SceneChangeMessage,
    JoinGameMessage,
    RedirectMessage,
    JoinedGameMessage,
    BaseRootPacket,
    PingPacket,
    MessageDirection,
    HostGameMessage,
    AllGameOptions,
    GetGameListMessage,
    GameListing,
    RemovePlayerMessage,
} from "@skeldjs/protocol";

import { Code2Int, VersionInfo, HazelWriter } from "@skeldjs/util";

import { PlayerData, RoomID } from "@skeldjs/core";
import { SkeldjsStateManager, SkeldjsStateManagerEvents } from "@skeldjs/state";
import { ExtractEventTypes } from "@skeldjs/events";

import { ClientConfig } from "./interface/ClientConfig";

import {
    ClientConnectEvent,
    ClientDisconnectEvent,
    ClientIdentifyEvent,
    ClientJoinEvent,
} from "./events";

const lookupDns = util.promisify(dns.lookup);

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

export interface SentPacket {
    nonce: number;
    ackd: boolean;
}

export type SkeldjsClientEvents = SkeldjsStateManagerEvents &
    ExtractEventTypes<
        [
            ClientConnectEvent,
            ClientDisconnectEvent,
            ClientIdentifyEvent,
            ClientJoinEvent
        ]
    >;

/**
 * Represents a programmable Among Us client.
 *
 * See {@link SkeldjsClientEvents} for events to listen to.
 */
export class SkeldjsClient extends SkeldjsStateManager<SkeldjsClientEvents> {
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
    version: VersionInfo;

    /**
     * The client ID of the client.
     */
    clientid: number;

    token: number;

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
        version: string | number | VersionInfo,
        options: ClientConfig = { allowHost: true }
    ) {
        super({ doFixedUpdate: true });

        this.options = options;

        if (version instanceof VersionInfo) {
            this.version = version;
        } else {
            this.version = VersionInfo.from(version);
        }

        this.packets_recv = [];
        this.packets_sent = [];

        this._reset();

        this.stream = [];

        this.decoder.on(
            [ReliablePacket, HelloPacket, PingPacket],
            (message) => {
                this.packets_recv.unshift(message.nonce);
                this.packets_recv.splice(8);

                this.ack(message.nonce);
            }
        );

        this.decoder.on(DisconnectPacket, (message) => {
            this.disconnect(message.reason, message.message);
        });

        this.decoder.on(AcknowledgePacket, (message) => {
            const sent = this.packets_sent.find(
                (s) => s.nonce === message.nonce
            );
            if (sent) sent.ackd = true;

            for (const missing of message.missingPackets) {
                if (missing < this.packets_recv.length) {
                    this.ack(this.packets_recv[missing]);
                }
            }
        });

        this.decoder.on(RemovePlayerMessage, async (message) => {
            if (message.clientid === this.clientid) {
                await this.disconnect(DisconnectReason.None);
            }
        });
    }

    getNextNonce() {
        this._nonce++;

        return this._nonce;
    }

    get me() {
        return this.players.get(this.clientid);
    }

    get amhost() {
        return this.hostid === this.clientid && this.options.allowHost;
    }

    private async ack(nonce: number) {
        await this.send(
            new AcknowledgePacket(
                nonce,
                this.packets_sent
                    .filter((packet) => packet.ackd)
                    .map((_, i) => i)
            )
        );
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
    async connect(
        host: "NA" | "EU" | "AS",
        username?: string,
        token?: number,
        port?: number,
        pem?: string
    );
    async connect(
        host: string,
        username?: string,
        token?: number,
        port?: number,
        pem?: string
    );
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
        this.token = token;

        this.socket = dgram.createSocket("udp4");
        this.connected = true;

        this.socket.on("message", this.handleInboundMessage.bind(this));

        const ev = await this.emit(new ClientConnectEvent(this, this.ip, this.port));

        if (!ev.canceled) {
            if (typeof username === "string") {
                await this.identify(username, this.token);
            }
        }
    }

    protected _reset() {
        if (this.socket) {
            this.socket.close();
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

        super._reset();
    }

    /**
     * Disconnect from the server currently connected to.
     */
    async disconnect(reason?: DisconnectReason, message?: string) {
        if (this.connected) {
            if (this.identified && !this.sent_disconnect) {
                await this.send(new DisconnectPacket(reason, message, true));
                this.sent_disconnect = true;
            }
            this.emit(
                new ClientDisconnectEvent(
                    this,
                    reason,
                    message || DisconnectMessages[reason]
                )
            );
            this._reset();
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
        const nonce = this.getNextNonce();
        await this.send(
            new HelloPacket(nonce, this.version, username, token)
        );

        await this.decoder.waitf(AcknowledgePacket, ack => ack.nonce ===  nonce);

        this.identified = true;
        this.username = username;
        this.token = token;
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
    async send(packet: BaseRootPacket): Promise<void> {
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
            writer.write(packet, MessageDirection.Serverbound, this.decoder);
            writer.realloc(writer.cursor);

            await this._send(writer.buffer);

            if ((packet as any).nonce !== undefined) {
                const sent = {
                    nonce: (packet as any).nonce,
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
                        }

                        if ((await this._send(writer.buffer)) === null) {
                            await this.disconnect();
                            clearInterval(interval);
                        }
                    }
                }, 1500);
            }
        } else {
            const writer = HazelWriter.alloc(512);
            writer.uint8(packet.tag);
            writer.write(packet, MessageDirection.Serverbound, this.decoder);
            writer.realloc(writer.cursor);

            await this._send(writer.buffer);
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
        messages: BaseGameDataMessage[],
        reliable: boolean = true,
        recipient: PlayerData | null = null,
        payloads: BaseRootMessage[] = []
    ) {
        if (recipient) {
            const children = [
                ...(messages.length
                    ? [new GameDataToMessage(this.code, recipient.id, messages)]
                    : []),
                ...payloads,
            ];

            await this.send(
                reliable
                    ? new ReliablePacket(this.getNextNonce(), children)
                    : new UnreliablePacket(children)
            );
        } else {
            const children = [
                ...(messages.length
                    ? [new GameDataMessage(this.code, messages)]
                    : []),
                ...payloads,
            ];

            await this.send(
                reliable
                    ? new ReliablePacket(this.getNextNonce(), children)
                    : new UnreliablePacket(children)
            );
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
            this.spawnPrefab(SpawnType.Player, this.me);
        } else {
            await this.send(
                new ReliablePacket(this.getNextNonce(), [
                    new GameDataMessage(this.code, [
                        new SceneChangeMessage(this.clientid, "OnlineGame"),
                    ]),
                ])
            );

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

        await this.send(
            new ReliablePacket(this.getNextNonce(), [new JoinGameMessage(code)])
        );

        const { message } = await Promise.race([
            this.decoder.waitf(
                JoinGameMessage,
                (message) => message.error !== undefined
            ),
            this.decoder.wait(RedirectMessage),
            this.decoder.wait(JoinedGameMessage),
            this.decoder.wait(DisconnectPacket),
        ]);

        switch (message.tag) {
            case RootMessageTag.JoinGame:
                throw new Error(
                    "Join error: Failed to join game, code: " +
                        message.error +
                        " (Message: " +
                        DisconnectMessages[message.error] +
                        ")"
                );
            case RootMessageTag.Redirect:
                const username = this.username;
                await this.disconnect();
                await this.connect(
                    message.ip,
                    username,
                    this.token,
                    message.port
                );

                return await this.joinGame(code, doSpawn);
            case RootMessageTag.JoinedGame:
                if (doSpawn) {
                    await this.spawnSelf();
                }

                return this.code;
            case SendOption.Disconnect:
                throw new Error(
                    "Join error: Failed to join game, code: " +
                        message.reason +
                        " (Message: " +
                        DisconnectMessages[message.reason] +
                        ")"
                );
                break;
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
     *   map: GameMap.TheSkeld,
     *   keywords: GameKeyword.English,
     *   numImpostors: 2
     * });
     * ```
     */
    async createGame(
        host_settings: Partial<AllGameOptions> = {},
        doJoin: boolean = true,
        chatMode: QuickChatMode = QuickChatMode.FreeChat
    ): Promise<number> {
        const settings = new GameOptions({
            ...host_settings,
            version: 2,
        });

        await this.send(
            new ReliablePacket(this.getNextNonce(), [
                new HostGameMessage(settings, chatMode),
            ])
        );

        const { message } = await Promise.race([
            this.decoder.waitf(
                JoinGameMessage,
                (message) => message.error !== undefined
            ),
            this.decoder.wait(RedirectMessage),
            this.decoder.wait(HostGameMessage),
        ]);

        switch (message.tag) {
            case RootMessageTag.JoinGame:
                throw new Error(
                    "Join error: Failed to create game, code: " +
                        message.error +
                        " (Message: " +
                        DisconnectMessages[message.error] +
                        ")"
                );
            case RootMessageTag.Redirect:
                const username = this.username;

                await this.disconnect();
                await this.connect(
                    message.ip,
                    username,
                    this.token,
                    message.port
                );

                return await this.createGame(host_settings, doJoin);
            case RootMessageTag.HostGame:
                this.settings.patch(settings);

                if (doJoin) {
                    await this.joinGame(message.code);
                    return message.code;
                } else {
                    return message.code;
                }
        }
    }

    /**
     * Search for public games.
     * @param maps The maps of games to look for. If a number, it will be a bitfield of the maps, else, it will be an array of the maps.
     * @param impostors The number of impostors to look for. 0 for any amount.
     * @param keyword The language of the game to look for, use {@link GameKeyword.All} for any.
     * @returns An array of game listings.
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
        maps: number | GameMap[] = 0x7 /* all maps */,
        impostors = 0 /* any impostors */,
        keyword = GameKeyword.All,
        quickchat = QuickChatMode.QuickChat
    ): Promise<GameListing[]> {
        if (Array.isArray(maps)) {
            return await this.findGames(
                maps.reduce(
                    (acc, cur) => acc | (1 << cur),
                    0
                ) /* convert to bitfield */,
                impostors,
                keyword
            );
        }

        const options = new GameOptions({
            map: maps,
            numImpostors: 0,
            keywords: GameKeyword.English,
        });

        await this.send(
            new ReliablePacket(this.getNextNonce(), [
                new GetGameListMessage(options, quickchat),
            ])
        );

        const { message } = await this.decoder.wait(GetGameListMessage);

        return message.gameList;
    }
}
