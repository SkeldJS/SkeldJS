import dgram from "dgram"

import {
    ClientConfig,
    DebugLevel
} from "./interface/ClientConfig"

import {
    DisconnectReason,
    DisconnectMessages,
    
    DistanceID,
    LanguageID,
    MessageTag,
    Opcode,
    PayloadTag,
    TaskBarUpdate,
    MapID,
    SpawnID
} from "@skeldjs/constant"

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
    parsePacket
} from "@skeldjs/protocol";

import {
    Room,
    Hostable
} from "@skeldjs/common";

import {
    Code2Int,
    Int2Code,
    HazelBuffer,
    sleep,
    unary,
    EncodeVersion,
    createMissingBitfield,
    getMissing,
    SentPacket
} from "@skeldjs/util";

type PacketFilter = (packet: ClientboundPacket) => boolean;
type PayloadFilter = (payload: PayloadMessageClientbound) => boolean;

export interface SkeldjsClient extends Hostable {}

const update_interval = 1000 / 50; // How often fixed update should get called.

export class SkeldjsClient extends Hostable {
    isServer = false as const;

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

    room: Room;

    settings_cache: GameOptions;
    stream: GameDataMessage[];

    constructor(version: string|number, options: ClientConfig = { debug: DebugLevel.None }) {
        super();

        this.options = options;

        if (typeof version === "number") {
            this.version = version;
        } else {
            const [ year, month, day, revision ] = version.split(".").map(unary(parseInt));
            this.version = EncodeVersion(year, month, day, revision);
        }

        this.packets_recv = [];
        this.packets_sent = [];

        this._reset();
        
        this.stream = [];

        setInterval(async () => {
            if (this.room) {
                if (this.room.amhost) {
                    for (const [ , component ] of this.room.netobjects) {
                        if (component) {
                            component.FixedUpdate();
                        }
                    }
                }

                if (this.stream.length) {
                    const stream = this.stream;
                    this.stream = [];

                    await this.send({
                        op: Opcode.Reliable,
                        payloads: [
                            {
                                tag: PayloadTag.GameData,
                                code: this.room.code,
                                messages: stream
                            }
                        ]
                    });
                }
            }
        }, update_interval);
    }

    get nonce() {
        this._nonce++;

        return this._nonce;
    }

    debug(level: number, ...fmt: any[]) {
        if (this.options.debug & level) {
            return fmt;
        }
    }

    async ack(nonce: number) {
        await this.send({
            op: Opcode.Acknowledge,
            nonce: nonce,
            missingPackets: createMissingBitfield(this.packets_sent)
        });
    }

    async onMessage(message: Buffer) {
        const packet = parsePacket(message, "client");

        switch (packet.op) {
        case Opcode.Reliable:
        case Opcode.Hello:
        case Opcode.Ping:
            this.packets_recv.push(packet.nonce);
            this.packets_recv.splice(8);

            this.ack(packet.nonce);
            break;
        }

        switch (packet.op) {
        case Opcode.Unreliable:
        case Opcode.Reliable:
            for (let i = 0; i < packet.payloads.length; i++) {
                const payload = packet.payloads[i];

                switch (payload.tag) {
                case PayloadTag.HostGame:
                    if (this.room) {
                        this.room.setCode(payload.code);
                    }
                    break;
                case PayloadTag.JoinGame:
                    if (payload.error === false) { // For typings
                        if (this.room && this.room.code === payload.code) {
                            await this.room.handleJoin(payload.clientid);
                            await this.room.setHost(payload.hostid);
                        }
                    }
                    break;
                case PayloadTag.StartGame:
                    if (this.room && this.room.code === payload.code) {
                        await this.room.startGame();
                    }
                    break;
                case PayloadTag.RemovePlayer:
                    if (this.room && this.room.code === payload.code) {
                        await this.room.handleLeave(payload.clientid);
                        await this.room.setHost(payload.hostid);
                    }
                    break;
                case PayloadTag.GameData:
                case PayloadTag.GameDataTo:
                    if (this.room && this.room.code === payload.code) {
                        for (let i = 0; i < payload.messages.length; i++) {
                            const message = payload.messages[i];

                            await this.room.handleGameData(message);
                        }
                    }
                    break;
                case PayloadTag.JoinedGame:
                    this.clientid = payload.clientid;

                    this.room = new Room(this, payload.code);
                    await this.room.setHost(payload.hostid);
                    
                    await this.room.handleJoin(this.clientid);
                    for (let i = 0; i < payload.clients.length; i++) {
                        await this.room.handleJoin(payload.clients[i]);
                    }
                    break;
                case PayloadTag.AlterGame:
                    break;
                }
            }
            break;
        case Opcode.Disconnect:
            await this.disconnect(packet.reason, packet.message);
            break;
        case Opcode.Acknowledge:
            const sent = this.packets_sent.find(s => s.nonce === packet.nonce);
            if (sent) sent.ackd = true;

            const missing = getMissing(this.packets_recv, packet.missingPackets);
            missing.forEach(this.ack.bind(this));
            break;
        }
        
        this.emit("packet", packet);
    }

    async connect(ip: string, port: number) {
        await this.disconnect();

        this.ip = ip;
        this.port = port;

        this.socket = dgram.createSocket("udp4");
        this.connected = true;

        this.socket.on("message", this.onMessage.bind(this));
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

        this.room = null;
    }

    async disconnect(reason?: DisconnectReason, message?: string) {
        if (this.connected) {
            if (this.identified && !this.sent_disconnect) {
                await this.send({
                    op: Opcode.Disconnect,
                    reason,
                    message,
                    show_reason: true
                });

                this.sent_disconnect = true;

                await new Promise<void>(resolve => {
                    const onDisconnect = () => {
                        this.off("disconnect", onDisconnect);

                        resolve();
                    }

                    this.on("disconnect", onDisconnect);

                    sleep(6000).then(() => {
                        this.off("disconnect", onDisconnect);
    
                        resolve();
                    });
                });
            } else if (this.sent_disconnect) {
                this.emit("disconnect", reason, message || DisconnectMessages[reason]);
                
                this._reset();
            }
        }
    }

    async identify(username: string) {
        await this.send({
            op: Opcode.Hello,
            hazelver: 0,
            clientver: this.version,
            username: username
        });

        this.identified = true;
        this.username = username;
    }

    waitPacket(filter: PacketFilter|PacketFilter[]): Promise<ClientboundPacket> {
        return new Promise((resolve, reject) => {
            const clearListeners = () => {
                this.off("packet", onPacket);
                this.off("disconnect", onDisconnect);
            }

            function onPacket(packet: ClientboundPacket) {
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

            function onDisconnect(reason: DisconnectReason, message: string) {
                clearListeners();
                reject("Client was disconnected reason: " + reason + ", message: " + message + ".");
            }

            this.on("packet",  onPacket);
            this.on("disconnect", onDisconnect);
        });
    }

    async waitPayload(filter: PayloadFilter|PayloadFilter[]): Promise<PayloadMessage> {
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

        const packet = await this.waitPacket(onPacket) as any; // Fixes typings...................

        return packet.payloads.find(findPayload);
    }

    private _send(buffer: Buffer): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject("Socket not initialised.");
            }

            this.socket.send(buffer, this.port, this.ip, (err, written) => {
                if (err) return reject(err);

                resolve(written);
            });
        });
    }

    async send(packet: ServerboundPacket, waitAck: boolean = true): Promise<number> {
        if (!this.socket) {
            return null;
        }

        if (packet.op === Opcode.Reliable || packet.op === Opcode.Hello || packet.op === Opcode.Ping) {
            // console.log("Sending reliable, ", util.inspect(packet, false, 10, true));
            packet.nonce = this.nonce;

            const { buffer } = composePacket(packet, "server") as HazelBuffer;

            const written = await this._send(buffer);

            this.packets_sent.push({
                nonce: packet.nonce,
                ackd: false
            });
            this.packets_sent.splice(8);

            if (waitAck) {
                let attempts = 0;

                const interval = setInterval(async () => {
                    if (++attempts > 8) {
                        await this.disconnect();   
                        clearInterval(interval);
                        this.emit("error", new Error("Server failed to acknowledge packet 8 times."));
                    }
                    await this._send(buffer);
                }, 1500);

                await this.waitPacket(packet => packet.op === Opcode.Acknowledge && packet.nonce === packet.nonce);

                clearInterval(interval);
            }

            return written;
        } else {
            const { buffer } = composePacket(packet, "server");

            return this._send(buffer);
        }
    }

    async spawn() {
        if (!this.room || this.room.me.inScene) {
            return;
        }

        if (this.room.amhost) {
            this.room.spawnPrefab(SpawnID.Player, this.room.me);
            this.room.setSettings(this.settings_cache);
        } else {
            await this.send({
                op: Opcode.Reliable,
                payloads: [
                    {
                        tag: PayloadTag.GameData,
                        code: this.room.code,
                        messages: [
                            {
                                tag: MessageTag.SceneChange,
                                clientid: this.clientid,
                                scene: "OnlineGame"
                            }
                        ]
                    }
                ]
            });
        }
    }

    async join(code: Room|number|string, doSpawn: boolean = true): Promise<Room> {
        if (typeof code === "undefined") {
            throw new Error("No code provided.");
        }

        if (typeof code === "string") {
            return this.join(Code2Int(code), doSpawn);
        }

        if (typeof code !== "number") {
            return this.join(code.code, doSpawn);
        }

        if (!this.identified) {
            return null;
        }

        if (this.room && this.room.code !== code) {
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
                    mapOwnership: 0x7 // All maps
                }
            ]
        });

        const payload = await this.waitPayload([
            payload => 
                payload.tag === PayloadTag.JoinGame &&
                payload.error,
            payload => 
                payload.tag === PayloadTag.Redirect,
            payload => 
                payload.tag === PayloadTag.JoinedGame
        ]) as JoinGamePayloadClientboundError|RedirectPayload|JoinedGamePayload;

        switch (payload.tag) {
        case PayloadTag.JoinGame:
            throw new Error("Join error: Failed to join game, code: " + payload.reason + " (Message: " + DisconnectMessages[payload.reason] + ")");
        case PayloadTag.Redirect:
            const username = this.username;

            await this.disconnect();
            await this.connect(payload.ip, payload.port);
            await this.identify(username)

            return await this.join(code, doSpawn);
        case PayloadTag.JoinedGame:
            if (this.room) {
                if (doSpawn) {
                    await this.spawn();
                }

                return this.room;
            }
        }

        return null;
    }

    async host(host_settings: Partial<GameOptions> = {}, doJoin: boolean = true): Promise<string> {
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
            ...host_settings
        } as GameOptions;

        await this.send({
            op: Opcode.Reliable,
            payloads: [
                {
                    tag: PayloadTag.HostGame,
                    settings
                }
            ]
        });

        const payload = await this.waitPayload([
            payload => 
                payload.tag === PayloadTag.JoinGame &&
                payload.error,
            payload => 
                payload.tag === PayloadTag.Redirect,
            payload => 
                payload.tag === PayloadTag.HostGame
        ]) as JoinGamePayloadClientboundError|RedirectPayload|HostGamePayloadClientbound;

        
        switch (payload.tag) {
        case PayloadTag.JoinGame:
            throw new Error("Join error: Failed to join game, code: " + payload.reason + " (Message: " + DisconnectMessages[payload.reason] + ")");
        case PayloadTag.Redirect:
            const username = this.username;

            await this.disconnect();
            await this.connect(payload.ip, payload.port);
            await this.identify(username);

            return await this.host(host_settings, doJoin);
        case PayloadTag.HostGame:
            this.settings_cache = settings;

            if (doJoin) {
                await this.join(payload.code);
                return Int2Code(payload.code);
            } else {
                return Int2Code(payload.code);
            }
        }
    }
}