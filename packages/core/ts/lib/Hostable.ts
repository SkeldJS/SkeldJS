import {
    GameDataMessage,
    SpawnMessage,
    GameOptions,
    PayloadMessage,
} from "@skeldjs/protocol";

import { Code2Int, HazelBuffer, sleep } from "@skeldjs/util";

import {
    MessageTag,
    SpawnID,
    DisconnectReason,
    PayloadTag,
    AlterGameTag,
    GameEndReason,
} from "@skeldjs/constant";

import { EventEmitter, PropagatedEvents } from "@skeldjs/events";

import {
    Airship,
    AprilShipStatus,
    BaseShipStatus,
    CustomNetworkTransform,
    GameData,
    GameDataEvents,
    Headquarters,
    LobbyBehaviour,
    LobbyBehaviourEvents,
    MeetingHud,
    MeetingHudEvents,
    PlanetMap,
    PlayerControl,
    PlayerIDResolvable,
    PlayerPhysics,
    ShipStatus,
    ShipStatusEvents,
    VoteBanSystem,
    VoteBanSystemEvents,
} from "./component";

import { Heritable } from "./Heritable";
import { Networkable } from "./Networkable";
import { PlayerData, PlayerDataEvents } from "./PlayerData";

import { SpawnPrefabs } from "./prefabs";

export type RoomID = string | number;

export type PlayerDataResolvable =
    | number
    | PlayerData
    | PlayerControl
    | PlayerPhysics
    | CustomNetworkTransform;
export type PrivacyType = "public" | "private";

export interface SpawnObject {
    type: number;
    ownerid: number;
    flags: number;
    components: Networkable[];
}

export type AnyNetworkable =
    | Airship
    | AprilShipStatus
    | CustomNetworkTransform
    | GameData
    | Headquarters
    | LobbyBehaviour
    | MeetingHud
    | PlanetMap
    | PlayerControl
    | PlayerPhysics
    | ShipStatus
    | VoteBanSystem;

export type HostableEvents = PropagatedEvents<
    PlayerDataEvents,
    { player: PlayerData }
> &
    ShipStatusEvents &
    GameDataEvents &
    LobbyBehaviourEvents &
    MeetingHudEvents &
    VoteBanSystemEvents & {
        "game.start": {};
        "game.end": {};
        "room.fixedupdate": {
            stream: GameDataMessage[];
        };
        "component.spawn": {
            component: AnyNetworkable;
        };
        "component.despawn": {
            component: AnyNetworkable;
        };
    };

export class Hostable<T extends Record<string, any> = any> extends Heritable<
    HostableEvents & T
> {
    objects: Map<number, Heritable>;
    players: Map<number, PlayerData>;
    netobjects: Map<number, Networkable>;
    stream: GameDataMessage[];

    code: number;

    hostid: number;

    private _incr_netid: number;

    settings: GameOptions;
    counter: number;

    privacy: PrivacyType;

    private _started: boolean;
    private last_fixed_update;

    constructor() {
        super(null, -2);

        this.hostid = null;

        this.objects = new Map();
        this.players = new Map();
        this.netobjects = new Map();
        this.stream = [];

        this.objects.set(-2, this);
        this.room = this;

        this._incr_netid = 0;

        setInterval(this.FixedUpdate.bind(this), Hostable.FixedUpdateInterval);
    }

    async emit(...args: any[]) {
        const event = args[0];
        const data = args[1];

        return EventEmitter.prototype.emit.call(this, event, data);
    }

    get incr_netid() {
        this._incr_netid++;

        return this._incr_netid;
    }

    get me(): PlayerData {
        return null;
    }

    get host() {
        return this.players.get(this.hostid);
    }

    get started() {
        return this._started;
    }

    get amhost() {
        return false;
    }

    get shipstatus() {
        return this.getComponent<
            ShipStatus | Headquarters | PlanetMap | AprilShipStatus | Airship
        >([ShipStatus, Headquarters, PlanetMap, AprilShipStatus, Airship]);
    }

    get meetinghud() {
        return this.getComponent(MeetingHud);
    }

    get lobbybehaviour() {
        return this.getComponent(LobbyBehaviour);
    }

    get gamedata() {
        return this.getComponent(GameData);
    }

    get votebansystem() {
        return this.getComponent(VoteBanSystem);
    }

    async broadcast(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        messages: GameDataMessage[],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reliable: boolean = true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        recipient: PlayerData = null,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        payloads: PayloadMessage[] = []
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) {}

    async FixedUpdate() {
        const delta = Date.now() - this.last_fixed_update;
        this.last_fixed_update = Date.now();
        for (const [, component] of this.netobjects) {
            if (
                component &&
                (component.ownerid === this.me?.id || this.amhost)
            ) {
                component.FixedUpdate(delta / 1000);
                if (component.dirtyBit) {
                    component.PreSerialize();
                    const writer = HazelBuffer.alloc(0);
                    if (component.Serialize(writer, false)) {
                        this.stream.push({
                            tag: MessageTag.Data,
                            netid: component.netid,
                            data: writer,
                        });
                    }
                    component.dirtyBit = 0;
                }
            }
        }

        await this.emit("room.fixedupdate", {
            stream: this.stream,
        });

        if (this.stream.length) {
            const stream = this.stream;
            this.stream = [];

            await this.broadcast(stream);
        }
    }

    resolvePlayer(player: PlayerDataResolvable) {
        return this.players.get(this.resolvePlayerClientID(player));
    }

    resolvePlayerId(player: PlayerIDResolvable) {
        if (typeof player === "number") {
            return player;
        }

        if (player instanceof PlayerData) {
            return player.playerId;
        }

        if (player instanceof PlayerControl) {
            return player.playerId;
        }

        return player.playerId;
    }

    resolvePlayerClientID(player: PlayerDataResolvable) {
        if (typeof player === "undefined") {
            return null;
        }

        if (typeof player === "number") {
            return player;
        }

        if (player instanceof Networkable) {
            return player.ownerid;
        }

        if (player instanceof PlayerData) {
            return player.id;
        }

        return null;
    }

    setCode(code: string | number) {
        if (typeof code === "string") {
            return this.setCode(Code2Int(code));
        }

        this.code = code;
    }

    protected _setAlterGameTag(tag: AlterGameTag, value: number) {
        switch (tag) {
            case AlterGameTag.ChangePrivacy:
                this.privacy = value ? "public" : "private";
                break;
        }
    }

    async setAlterGameTag(tag: AlterGameTag, value: number) {
        this._setAlterGameTag(tag, value);

        if (this.amhost) {
            await this.broadcast([], true, null, [
                {
                    tag: PayloadTag.AlterGame,
                    code: this.code,
                    alter_tag: AlterGameTag.ChangePrivacy,
                    value,
                },
            ]);
        }
    }

    async setPublic(is_public = true) {
        await this.setAlterGameTag(
            AlterGameTag.ChangePrivacy,
            is_public ? 1 : 0
        );
    }

    async setVisibility(visibility: PrivacyType) {
        await this.setPublic(visibility === "public");
    }

    setSettings(settings: Partial<GameOptions>) {
        this.settings = {
            ...this.settings,
            ...settings,
        } as GameOptions;

        if (this.amhost) {
            if (this.me?.control) {
                this.me.control.syncSettings(this.settings);
            }
        }
    }

    setHost(host: PlayerDataResolvable) {
        const before = this.hostid;
        const resolved_id = this.resolvePlayerClientID(host);

        this.hostid = resolved_id;

        if (this.amhost) {
            if (!this.lobbybehaviour) {
                this.spawnPrefab(SpawnID.LobbyBehaviour, -2);
            }

            if (!this.gamedata) {
                this.spawnPrefab(SpawnID.GameData, -2);
            }
        }

        if (before !== this.hostid && this.host) {
            this.host.emit("player.sethost", {});
        }
    }

    private _addPlayer(player: PlayerData) {
        player.emit("player.join", {});
    }

    handleJoin(clientid: number) {
        if (this.objects.has(clientid)) return null;

        const player = new PlayerData(this, clientid);
        this.players.set(clientid, player);
        this.objects.set(clientid, player);

        this._addPlayer(player);

        return player;
    }

    private _removePlayer(player: PlayerData) {
        player.emit("player.leave", {});
    }

    handleLeave(resolvable: PlayerDataResolvable) {
        const player = this.resolvePlayer(resolvable);

        if (!player) return null;

        if (this.gamedata && this.gamedata.players.get(player.playerId)) {
            this.gamedata.remove(player.playerId);
        }

        if (this.votebansystem && this.votebansystem.voted.get(player.id)) {
            this.votebansystem.voted.delete(player.id);
        }

        for (let i = 0; i < player.components.length; i++) {
            const component = player.components[i];

            if (component)
                this.despawnComponent(component);
        }

        this.players.delete(player.id);
        this.objects.delete(player.id);

        this._removePlayer(player);
        return player;
    }

    private _startGame() {
        this._started = true;
        this.emit("game.start", {});
    }

    async handleStart() {
        if (this._started) return;

        this._startGame();
        if (this.amhost) {
            await Promise.all([
                this.broadcast([], true, null, [
                    {
                        tag: PayloadTag.StartGame,
                        code: this.code,
                    },
                ]),
                Promise.race([
                    Promise.all([...this.players.values()].map(player => player.wait("player.ready"))),
                    sleep(5000)
                ]),
                this.me?.ready()
            ]);

            const removes = [];
            for (const [clientId, player] of this.players) {
                if (!player.isReady)
                    removes.push(clientId);
            }

            if (removes.length) {
                await this.broadcast(
                    [],
                    true,
                    null,
                    removes.map((clientId) => {
                        return {
                            tag: PayloadTag.RemovePlayer,
                            code: this.code,
                            clientid: clientId,
                            reason: DisconnectReason.Error,
                        };
                    })
                );
            }

            if (this.lobbybehaviour) this.despawnComponent(this.lobbybehaviour);

            const ship_prefabs = [
                SpawnID.ShipStatus,
                SpawnID.Headquarters,
                SpawnID.PlanetMap,
                SpawnID.AprilShipStatus,
                SpawnID.Airship,
            ];
            const object = this.spawnPrefab(
                ship_prefabs[this.settings?.map],
                -2
            );
            const shipstatus = object.components[0] as BaseShipStatus;
            shipstatus.selectInfected();
            shipstatus.begin();
        } else {
            if (this.me) await this.me.ready();
        }
    }

    private _endGame(reason: GameEndReason) {
        this._started = false;
        this.emit("game.end", { reason });
    }

    async handleEnd(reason: GameEndReason) {
        this._endGame(reason);
    }

    async beginCountdown() {
        this.me.control.setStartCounter(5);
        await sleep(1000);
        this.me.control.setStartCounter(4);
        await sleep(1000);
        this.me.control.setStartCounter(3);
        await sleep(1000);
        this.me.control.setStartCounter(2);
        await sleep(1000);
        this.me.control.setStartCounter(1);
        await sleep(1000);
        this.me.control.setStartCounter(0);

        sleep(1000).then(() => {
            this.me.control.setStartCounter(-1);
        });
    }

    async startGame() {
        return await this.handleStart();
    }

    async endGame(reason: GameEndReason) {
        return await this.handleEnd(reason);
    }

    async handleReady(player: PlayerDataResolvable) {
        const resolved = this.resolvePlayer(player);

        await resolved.ready();
    }

    spawnComponent(component: Networkable) {
        if (this.netobjects.get(component.netid)) {
            return;
        }

        this.netobjects.set(component.netid, component);
        component.owner.components.push(component);

        component.emit("component.spawn", {});
        if (component.ownerid !== -2) {
            component.emit("player.component.spawn", {});
        }
    }

    private _despawnComponent(component: Networkable) {
        this.netobjects.delete(component.netid);

        component.emit("component.despawn", {});
        if (component.ownerid !== -2) {
            component.emit("player.component.despawn", {});
        }
        component.owner.components.splice(
            component.owner.components.indexOf(component),
            1,
            null
        );
    }

    despawnComponent(component: Networkable) {
        this._despawnComponent(component);

        this.stream.push({
            tag: MessageTag.Despawn,
            netid: component.netid,
        });
    }

    private getAvailablePlayerID() {
        for (let i = 0; i < 10; i++) {
            if (!this.getPlayerByPlayerId(i)) {
                return i;
            }
        }

        return null;
    }

    spawnPrefab(type: SpawnID, owner: Heritable | number): SpawnObject {
        const ownerid = typeof owner === "number" ? owner : owner.id;

        const object: Partial<SpawnObject> = {
            type: SpawnID.ShipStatus,
            ownerid: ownerid,
            flags: type === SpawnID.Player ? 1 : 0,
            components: [],
        };

        switch (type) {
            case SpawnID.ShipStatus: {
                const shipstatus = new ShipStatus(
                    this,
                    this.incr_netid,
                    ownerid
                );

                this.spawnComponent(shipstatus);

                object.components.push(shipstatus);
                break;
            }
            case SpawnID.MeetingHud:
                const meetinghud = new MeetingHud(
                    this,
                    this.incr_netid,
                    ownerid,
                    {
                        dirtyBit: 0,
                        players: new Map(),
                    }
                );

                this.spawnComponent(meetinghud);

                object.components.push(meetinghud);
                break;
            case SpawnID.LobbyBehaviour:
                const lobbybehaviour = new LobbyBehaviour(
                    this,
                    this.incr_netid,
                    ownerid,
                    {}
                );

                this.spawnComponent(lobbybehaviour);

                object.components.push(lobbybehaviour);
                break;
            case SpawnID.GameData:
                const gamedata = new GameData(this, this.incr_netid, ownerid, {
                    dirtyBit: 0,
                    players: new Map(),
                });

                this.spawnComponent(gamedata);

                const votebansystem = new VoteBanSystem(
                    this,
                    this.incr_netid,
                    ownerid,
                    {
                        clients: new Map(),
                    }
                );

                this.spawnComponent(votebansystem);

                object.components.push(gamedata);
                object.components.push(votebansystem);
                break;
            case SpawnID.Player:
                const playerId = this.getAvailablePlayerID();

                if (this.gamedata) this.gamedata.add(playerId);

                const control = new PlayerControl(
                    this,
                    this.incr_netid,
                    ownerid,
                    {
                        isNew: true,
                        playerId,
                    }
                );

                this.spawnComponent(control);

                const physics = new PlayerPhysics(
                    this,
                    this.incr_netid,
                    ownerid,
                    {}
                );

                this.spawnComponent(physics);

                const transform = new CustomNetworkTransform(
                    this,
                    this.incr_netid,
                    ownerid,
                    {
                        seqId: 1,
                        position: {
                            x: 0,
                            y: 0,
                        },
                        velocity: {
                            x: 0,
                            y: 0,
                        },
                    }
                );

                this.spawnComponent(transform);

                object.components.push(control);
                object.components.push(physics);
                object.components.push(transform);
                break;
            case SpawnID.Headquarters:
                const headquarters = new Headquarters(
                    this,
                    this.incr_netid,
                    ownerid
                );

                this.spawnComponent(headquarters);

                object.components.push(headquarters);
                break;
            case SpawnID.PlanetMap:
                const planetmap = new PlanetMap(this, this.incr_netid, ownerid);

                this.spawnComponent(planetmap);

                object.components.push(planetmap);
                break;
            case SpawnID.AprilShipStatus:
                const aprilshipstatus = new AprilShipStatus(
                    this,
                    this.incr_netid,
                    ownerid
                );

                this.spawnComponent(aprilshipstatus);

                object.components.push(aprilshipstatus);
                break;
            case SpawnID.Airship:
                const airship = new Airship(this, this.incr_netid, ownerid);

                this.spawnComponent(airship);

                object.components.push(airship);
                break;
        }

        this.stream.push({
            tag: MessageTag.Spawn,
            ownerid: object.ownerid,
            type: type,
            flags: object.flags,
            components: object.components.map((component) => {
                const data = HazelBuffer.alloc(0);
                component.Serialize(data, true);

                return {
                    netid: component.netid,
                    data,
                };
            }),
        });

        return object as SpawnObject;
    }

    getPlayerByPlayerId(playerId: number) {
        for (const [, player] of this.players) {
            if (player.playerId === playerId) return player;
        }

        return null;
    }

    getPlayerByNetID(netid: number) {
        for (const [, player] of this.players) {
            if (
                player.components.find(
                    (component) => component?.netid === netid
                )
            )
                return player;
        }

        return null;
    }

    async handleGameData(message: GameDataMessage) {
        switch (message.tag) {
            case MessageTag.Data: {
                const component = this.netobjects.get(message.netid);

                if (component) {
                    component.Deserialize(message.data);
                }
                break;
            }
            case MessageTag.RPC: {
                const component = this.netobjects.get(message.netid);

                if (component) {
                    component.HandleRPC(message);
                }
                break;
            }
            case MessageTag.Spawn: {
                for (let i = 0; i < message.components.length; i++) {
                    const spawn_component = message.components[i];
                    const owner = this.objects.get(message.ownerid);

                    if (owner) {
                        const component = new SpawnPrefabs[message.type][i](
                            this,
                            spawn_component.netid,
                            message.ownerid,
                            spawn_component.data
                        );

                        if (this.netobjects.get(component.netid)) continue;

                        this.spawnComponent(component);
                    }
                }
                break;
            }
            case MessageTag.Despawn: {
                const component = this.netobjects.get(message.netid);

                if (component) {
                    this._despawnComponent(component);
                }
                break;
            }
            case MessageTag.SceneChange: {
                const player = this.objects.get(message.clientid) as PlayerData;

                if (player) {
                    if (message.scene === "OnlineGame") {
                        player.inScene = true;

                        if (this.amhost) {
                            await this.broadcast(
                                [...this.netobjects.values()].reduce<
                                    SpawnMessage[]
                                >((acc, component) => {
                                    let col = acc.find(
                                        (msg) =>
                                            msg.type === component.type &&
                                            msg.ownerid === component.ownerid
                                    );

                                    if (!col) {
                                        acc.push({
                                            tag: MessageTag.Spawn,
                                            type: component.type,
                                            ownerid: component.ownerid,
                                            flags:
                                                component.classname ===
                                                "PlayerControl"
                                                    ? 1
                                                    : 0,
                                            components: [],
                                        });

                                        col = acc.find(
                                            (msg) =>
                                                msg.type === component.type &&
                                                msg.ownerid ===
                                                    component.ownerid
                                        );
                                    }

                                    const data = HazelBuffer.alloc(0);
                                    component.Serialize(data, true);

                                    col.components.push({
                                        netid: component.netid,
                                        data,
                                    });

                                    return acc;
                                }, []),
                                true,
                                player
                            );

                            this.spawnPrefab(SpawnID.Player, player);

                            if (this.me) {
                                this.me.control.syncSettings(this.settings);
                            }

                            player.emit("player.scenechange", {});
                        }
                    }
                }
                break;
            }
            case MessageTag.Ready: {
                const player = this.players.get(message.clientid);

                if (player) {
                    player.ready();
                }
                break;
            }
        }
    }

    static FixedUpdateInterval = 1 / 50;
}
