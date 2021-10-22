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
    GameKeyword
} from "@skeldjs/constant";

import { DisconnectMessages, MatchmakingServers } from "@skeldjs/data";

import {
    AcknowledgePacket,
    BaseRootMessage,
    DisconnectPacket,
    GameSettings,
    HelloPacket,
    BaseGameDataMessage,
    GameDataToMessage,
    ReliablePacket,
    UnreliablePacket,
    GameDataMessage,
    SceneChangeMessage,
    JoinGameMessage,
    RedirectMessage,
    BaseRootPacket,
    MessageDirection,
    HostGameMessage,
    AllGameSettings,
    GetGameListMessage,
    GameListing,
    RemovePlayerMessage,
    StartGameMessage
} from "@skeldjs/protocol";

import { Code2Int, VersionInfo, HazelWriter, HazelReader } from "@skeldjs/util";
import { LobbyBehaviour, PlayerData, PlayerJoinEvent, RoomID } from "@skeldjs/core";
import { SkeldjsStateManager, SkeldjsStateManagerEvents } from "@skeldjs/state";
import { ExtractEventTypes } from "@skeldjs/events";

import { ClientConfig } from "./interface/ClientConfig";

import {
    ClientConnectEvent,
    ClientDisconnectEvent,
    ClientIdentifyEvent,
    ClientJoinEvent,
} from "./events";

import { AuthClient } from "./AuthClient";
import { JoinError } from "./errors/JoinError";

const lookupDns = util.promisify(dns.lookup);

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

    /**
     * The datagram socket for the client.
     */
    socket?: dgram.Socket;

    /**
     * Auth client responsible for getting an authentication token from the
     * connected-to server.
     */
    auth: AuthClient;

    /**
     * The IP of the server that the client is currently connected to.
     */
    ip?: string;

    /**
     * The port of the server that the client is currently connected to.
     */
    port?: number;

    /**
     * An array of 8 of the most recent packets received from the server.
     */
    packetsReceived: number[];

    /**
     * An array of 8 of the most recent packet sent by the client.
     */
    packetsSent: SentPacket[];

    private _nonce = 0;

    /**
     * Whether or not the client is currently connected to a server.
     */
    connected!: boolean;

    /**
     * Whether or not the client has sent a disconnect packet.
     */
    sent_disconnect!: boolean;

    /**
     * Whether or not the client is identified with the connected server.
     */
    identified!: boolean;

    /**
     * The username of the client.
     */
    username?: string;

    /**
     * The version of the client.
     */
    version: VersionInfo;

    /**
     * The client ID of the client.
     */
    clientId!: number;

    token?: number;

    nextExpectedNonce?: number;
    unorderedMessageMap: Map<number, ReliablePacket>;

    /**
     * Create a new Skeldjs client instance.
     * @param version The version of the client.
     * @param options Additional client options.
     * @example
     *```typescript
     * const client = new SkeldjsClient("2021.4.25");
     * ```
     */
    constructor(
        version: string | number | VersionInfo,
        options: Partial<ClientConfig> = {}
    ) {
        super({ doFixedUpdate: true });

        this.options = {
            doFixedUpdate: true,
            attemptAuth: true,
            allowHost: true,
            language: GameKeyword.English,
            chatMode: QuickChatMode.FreeChat,
            messageOrdering: false,
            ...options
        };

        this.auth = new AuthClient(this);

        if (version instanceof VersionInfo) {
            this.version = version;
        } else {
            this.version = VersionInfo.from(version);
        }

        this.packetsReceived = [];
        this.packetsSent = [];

        this.nextExpectedNonce = undefined;
        this.unorderedMessageMap = new Map;

        this._reset();

        this.stream = [];

        this.decoder.on(DisconnectPacket, (message) => {
            this.disconnect(message.reason, message.message);
        });

        this.decoder.on(AcknowledgePacket, (message) => {
            const sent = this.packetsSent.find(
                (s) => s.nonce === message.nonce
            );
            if (sent) sent.ackd = true;

            for (const missing of message.missingPackets) {
                if (missing < this.packetsReceived.length) {
                    this.ack(this.packetsReceived[missing]);
                }
            }
        });

        this.decoder.on(RemovePlayerMessage, async (message) => {
            if (message.clientid === this.clientId) {
                await this.disconnect(DisconnectReason.None);
            }
        });
    }

    getNextNonce() {
        this._nonce++;

        if (this._nonce > 65535) {
            this._nonce = 1;
        }

        return this._nonce;
    }

    getLastNonce() {
        return this._nonce;
    }

    get myPlayer() {
        return this.players.get(this.clientId);
    }

    get hostIsMe() {
        return this.hostId === this.clientId && this.options.allowHost || false;
    }

    private async ack(nonce: number) {
        await this.send(
            new AcknowledgePacket(
                nonce,
                this.packetsSent
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
        port?: number
    ): Promise<void>;
    async connect(
        host: string,
        username?: string,
        port?: number
    ): Promise<void>;
    async connect(
        host: string,
        username?: string,
        port: number = 22023
    ) {
        await this.disconnect();

        if (host in MatchmakingServers) {
            return await this.connect(
                MatchmakingServers[host as "NA"|"EU"|"AS"][0],
                username,
                22023
            );
        }

        const ip = await lookupDns(host);

        this.nextExpectedNonce = undefined;
        this.ip = ip.address;
        this.port = port;

        this.token = this.options.attemptAuth
            ? await this.auth.getAuthToken(this.ip, this.port + 2)
            : 0;

        this.socket = dgram.createSocket("udp4");
        this.connected = true;

        this.socket.on("message", this.handleInboundMessage.bind(this));

        const ev = await this.emit(
            new ClientConnectEvent(
                this,
                this.ip,
                this.port
            )
        );

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

        this.unorderedMessageMap.clear();
        this.ip = undefined;
        this.port = undefined;
        this.socket = undefined;
        this.sent_disconnect = false;
        this.connected = false;
        this.identified = false;
        this.username = undefined;

        this.packetsSent = [];
        this.packetsReceived = [];

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
                    message || DisconnectMessages[reason as keyof typeof DisconnectMessages]
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
    async identify(username: string, token: number = 0) {
        const ev = await this.emit(
            new ClientIdentifyEvent(
                this,
                username,
                token
            )
        );

        if (ev.canceled)
            return;

        const nonce = this.getNextNonce();
        await this.send(
            new HelloPacket(
                nonce,
                this.version,
                username,
                token,
                this.options.language,
                this.options.chatMode
            )
        );

        await this.decoder.waitf(AcknowledgePacket, ack => ack.nonce ===  nonce);

        this.identified = true;
        this.username = username;
        this.token = token;
    }

    protected _send(buffer: Buffer): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                return resolve(0);
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
            return;
        }

        if (
            packet.messageTag === SendOption.Reliable ||
            packet.messageTag === SendOption.Hello ||
            packet.messageTag === SendOption.Ping
        ) {
            const writer = HazelWriter.alloc(512);
            writer.uint8(packet.messageTag);
            writer.write(packet, MessageDirection.Serverbound, this.decoder);
            writer.realloc(writer.cursor);

            await this._send(writer.buffer);

            if ((packet as any).nonce !== undefined) {
                const sent = {
                    nonce: (packet as any).nonce,
                    ackd: false,
                };

                this.packetsSent.unshift(sent);
                this.packetsSent.splice(8);

                let attempts = 0;
                const interval: NodeJS.Timeout = setInterval(async () => {
                    if (sent.ackd) {
                        return clearInterval(interval);
                    } else {
                        if (
                            !this.packetsSent.find(
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
            writer.uint8(packet.messageTag);
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
        recipient: PlayerData | number | undefined = undefined,
        payloads: BaseRootMessage[] = []
    ) {
        const recipientid = typeof recipient === "number"
            ? recipient
            : recipient?.clientId;

        if (recipientid !== undefined) {
            const children = [
                ...(messages.length
                    ? [new GameDataToMessage(this.code, recipientid, messages)]
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

    async handleInboundMessage(message: Buffer) {
        const parsedPacket = this.decoder.parse(message, MessageDirection.Clientbound);

        if (!parsedPacket)
            return;

        const parsedReliable = parsedPacket as ReliablePacket;

        const isReliable = parsedReliable.nonce !== undefined && parsedPacket.messageTag !== SendOption.Acknowledge;

        if (isReliable) {
            if (this.nextExpectedNonce === undefined) {
                this.nextExpectedNonce = parsedReliable.nonce;
            }

            this.packetsReceived.unshift(parsedReliable.nonce);
            this.packetsReceived.splice(8);

            await this.ack(parsedReliable.nonce);

            if (parsedReliable.nonce < this.nextExpectedNonce - 1) {
                return;
            }

            if (parsedReliable.nonce !== this.nextExpectedNonce && this.options.messageOrdering) {
                if (!this.unorderedMessageMap.has(parsedReliable.nonce)) {
                    this.unorderedMessageMap.set(parsedReliable.nonce, parsedReliable);
                }

                return;
            }

            this.nextExpectedNonce++;
        }

        await this.decoder.emitDecoded(parsedPacket, MessageDirection.Clientbound, undefined);

        if (isReliable && this.options.messageOrdering) {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const nextMessage = this.unorderedMessageMap.get(this.nextExpectedNonce!);
                if (!nextMessage)
                    break;

                await this.decoder.emitDecoded(nextMessage, MessageDirection.Clientbound, undefined);

                this.unorderedMessageMap.delete(this.nextExpectedNonce!);
                this.nextExpectedNonce!++;
            }
        }
    }

    async handleOutboundMessage(message: Buffer) {
        const reader = HazelReader.from(message);
        this.decoder.write(reader, MessageDirection.Serverbound, null);
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
        if (!this.myPlayer || this.myPlayer.inScene) {
            return;
        }

        if (this.hostIsMe) {
            this.spawnPrefab(SpawnType.Player, this.myPlayer.clientId);
        } else {
            await this.send(
                new ReliablePacket(this.getNextNonce(), [
                    new GameDataMessage(this.code, [
                        new SceneChangeMessage(this.clientId, "OnlineGame"),
                    ]),
                ])
            );

            const ev = await this.myPlayer.waitf("player.spawn", ev => ev.player.clientId === this.clientId);

            if (ev.player.playerId === undefined || !ev.player.control?.isNew)
                return;

            if (this.lobbyBehaviour) {
                const spawnPosition = LobbyBehaviour.spawnPositions[ev.player.playerId];
                const offsetted = spawnPosition
                    .add(spawnPosition.negate().normalize());

                ev.player.transform?.snapTo(offsetted);
            } else if (this.shipStatus) {
                const spawnPosition = this.shipStatus.getSpawnPosition(ev.player, true);
                ev.player.transform?.snapTo(spawnPosition);
            }
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
            throw new TypeError("No code provided.");
        }

        if (typeof code === "string") {
            return this.joinGame(Code2Int(code), doSpawn);
        }

        if (!this.ip) {
            throw new Error("Tried to join while not connected.");
        }

        if (!this.identified) {
            throw new Error("Tried to join while not identified.");
        }

        if (this.myPlayer && this.code !== code) {
            const username = this.username;
            await this.disconnect();
            await this.connect(this.ip, username, this.port);
        }

        await this.send(
            new ReliablePacket(
                this.getNextNonce(),
                [
                    new JoinGameMessage(code)
                ]
            )
        );

        const data = await Promise.race([
            this.decoder.waitf(
                JoinGameMessage,
                (message) => message.error !== undefined
            ),
            this.decoder.wait(RedirectMessage),
            this.wait("client.disconnect"),
            this.waitf("player.join", ev => ev.player.clientId === this.clientId)
        ]);

        if (data instanceof ClientDisconnectEvent) {
            throw new JoinError(data.reason, data.message || DisconnectMessages[data.reason || DisconnectReason.None]);
        }

        if (data instanceof PlayerJoinEvent) {
            if (doSpawn) {
                await this.spawnSelf();
            }

            return this.code;
        }

        const { message } = data;

        switch (message.messageTag) {
            case RootMessageTag.JoinGame:
                throw new JoinError(message.error, message.message || DisconnectMessages[message.error || DisconnectReason.None]);
            case RootMessageTag.Redirect:
                const username = this.username;
                await this.disconnect();
                await this.connect(
                    message.ip,
                    username,
                    message.port
                );

                return await this.joinGame(code, doSpawn);
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
        host_settings: Partial<AllGameSettings> = {},
        chatMode: QuickChatMode = QuickChatMode.FreeChat,
        doJoin: boolean = true
    ): Promise<number> {
        const settings = new GameSettings({
            ...host_settings,
            version: 2,
        });

        await this.send(
            new ReliablePacket(this.getNextNonce(), [
                new HostGameMessage(settings, chatMode),
            ])
        );

        const data= await Promise.race([
            this.decoder.waitf(
                JoinGameMessage,
                (message) => message.error !== undefined
            ),
            this.decoder.wait(RedirectMessage),
            this.decoder.wait(HostGameMessage),
            this.wait("client.disconnect"),
        ]);

        if (data instanceof ClientDisconnectEvent) {
            throw new JoinError(data.reason, data.message || DisconnectMessages[data.reason || DisconnectReason.None]);
        }

        const { message } = data;

        switch (message.messageTag) {
            case RootMessageTag.JoinGame:
                throw new JoinError(message.error, DisconnectMessages[message.error || DisconnectReason.None] || message.message);
            case RootMessageTag.Redirect:
                const username = this.username;

                await this.disconnect();
                await this.connect(
                    message.ip,
                    username,
                    message.port
                );

                return await this.createGame(host_settings, chatMode, doJoin);
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
     * const client = new SkeldjsClient("2021.4.25");

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

        const options = new GameSettings({
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

    /**
     * Ask the server to start a game.
     */
    async startGame() {
        await this.broadcast([], true, undefined, [new StartGameMessage(this.code)]);
    }
}
