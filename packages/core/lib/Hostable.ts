import {
    SpawnMessage,
    GameSettings,
    BaseGameDataMessage,
    BaseRootMessage,
    DataMessage,
    AlterGameMessage,
    StartGameMessage,
    RemovePlayerMessage,
    DespawnMessage,
    ComponentSpawnData,
    PacketDecoder,
    RpcMessage,
    SceneChangeMessage,
    ReadyMessage,
    AllGameSettings
} from "@skeldjs/protocol";

import {
    Code2Int,
    HazelReader,
    HazelWriter,
    sleep
} from "@skeldjs/util";

import {
    DisconnectReason,
    AlterGameTag,
    GameOverReason,
    SpawnType,
    SpawnFlag
} from "@skeldjs/constant";

import { ExtractEventTypes } from "@skeldjs/events";

import {
    AirshipStatus,
    AprilShipStatus,
    CustomNetworkTransform,
    GameData,
    GameDataEvents,
    MiraShipStatus,
    LobbyBehaviour,
    LobbyBehaviourEvents,
    MeetingHud,
    MeetingHudEvents,
    PolusShipStatus,
    PlayerControl,
    PlayerPhysics,
    SkeldShipStatus,
    ShipStatusEvents,
    VoteBanSystem,
    VoteBanSystemEvents,
    PlayerIDResolvable,
    InnerShipStatus,
} from "./objects";

import { Heritable, HeritableEvents, NetworkableConstructor } from "./Heritable";
import { Networkable, NetworkableEvents } from "./Networkable";
import { PlayerData, PlayerDataEvents } from "./PlayerData";

import { HostableOptions } from "./misc/HostableOptions";

import {
    ComponentDespawnEvent,
    ComponentSpawnEvent,
    PlayerJoinEvent,
    PlayerLeaveEvent,
    PlayerSceneChangeEvent,
    PlayerSetHostEvent,
    PlayerSpawnEvent,
    RoomFixedUpdateEvent,
    RoomGameEndEvent,
    RoomGameStartEvent,
    RoomSetPrivacyEvent,
} from "./events";

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
    components: Networkable<any, any>[];
}

export type AnyNetworkable<RoomType extends Hostable = Hostable> =
    | AirshipStatus<RoomType>
    | AprilShipStatus<RoomType>
    | CustomNetworkTransform<RoomType>
    | GameData<RoomType>
    | MiraShipStatus<RoomType>
    | LobbyBehaviour<RoomType>
    | MeetingHud<RoomType>
    | PolusShipStatus<RoomType>
    | PlayerControl<RoomType>
    | PlayerPhysics<RoomType>
    | SkeldShipStatus<RoomType>
    | VoteBanSystem<RoomType>;

export type HostableEvents<RoomType extends Hostable = Hostable> = HeritableEvents<RoomType> &
    PlayerDataEvents<RoomType> &
    GameDataEvents<RoomType> &
    LobbyBehaviourEvents<RoomType> &
    MeetingHudEvents<RoomType> &
    ShipStatusEvents<RoomType> &
    VoteBanSystemEvents<RoomType> &
    ExtractEventTypes<
        [
            RoomGameStartEvent<RoomType>,
            RoomGameEndEvent<RoomType>,
            RoomFixedUpdateEvent<RoomType>,
            RoomSetPrivacyEvent<RoomType>
        ]
    >;

export type GetHostableEvents<T extends Hostable<HostableEvents>> = T extends Hostable<infer X> ? X : never;
/**
 * Represents an object capable of hosting games.
 *
 * See {@link HostableEvents} for events to listen to.
 */
export class Hostable<
    T extends HostableEvents = any
> extends Heritable<T> {
    room: this;

    /**
     * A list of all objects in the room.
     */
    objectList: Networkable[];

    /**
     * The players in the room.
     */
    players: Map<number, PlayerData<this>>;

    /**
     * The networkable components in the room.
     */
    netobjects: Map<number, Networkable<any, NetworkableEvents, this>>;

    registeredPrefabs: Map<SpawnType, typeof Networkable[]>;

    /**
     * The current message stream to be sent to the server on fixed update.
     */
    stream: BaseGameDataMessage[];

    /**
     * The code of the room.
     */
    code: number;

    /**
     * The ID of the host of the room.
     */
    hostid: number;

    protected _incr_netid: number;

    /**
     * The settings of the room.
     */
    settings: GameSettings;

    /**
     * The current start counter for the room.
     */
    counter: number;

    /**
     * The privacy state of the room.
     */
    privacy: PrivacyType;

    /**
     * The packet decoder.
     */
    decoder: PacketDecoder;

    shipstatus: InnerShipStatus<this>|undefined;
    meetinghud: MeetingHud<this>|undefined;
    lobbybehaviour: LobbyBehaviour<this>|undefined;
    gamedata: GameData<this>|undefined;
    votebansystem: VoteBanSystem<this>|undefined;

    /**
     * Whether or not this room has been destroyed.
     */
    protected _destroyed: boolean;

    protected _started: boolean;
    protected last_fixed_update: number;

    protected _interval?: NodeJS.Timeout;

    spawnPrefabs: NetworkableConstructor<any>[][] = [
        [SkeldShipStatus],
        [MeetingHud],
        [LobbyBehaviour],
        [GameData, VoteBanSystem],
        [PlayerControl, PlayerPhysics, CustomNetworkTransform],
        [MiraShipStatus],
        [PolusShipStatus],
        [AprilShipStatus],
        [AirshipStatus],
    ]

    constructor(public options: HostableOptions = {}) {
        super(null as unknown as this, -2);

        this.code = 0;
        this.hostid = -1;
        this.counter = -1;
        this.privacy = "private";

        this.settings = new GameSettings;

        this.objectList = [];
        this.players = new Map;
        this.netobjects = new Map;
        this.registeredPrefabs = new Map;
        this.stream = [];

        this.room = this;

        this.decoder = new PacketDecoder;

        this.shipstatus = undefined;
        this.meetinghud = undefined;
        this.lobbybehaviour = undefined;
        this.gamedata = undefined;
        this.votebansystem = undefined;

        this._incr_netid = 0;
        this._destroyed = false;
        this._started = false;

        this.last_fixed_update = 0;

        if (options.doFixedUpdate) {
            this._interval = setInterval(
                () => this.FixedUpdate(),
                Hostable.FixedUpdateInterval
            );
        }

        this.decoder.on(AlterGameMessage, async message => {
            if (message.alterTag === AlterGameTag.ChangePrivacy) {
                const messagePrivacy = message.value ? "public" : "private";
                const oldPrivacy = this.privacy;
                const ev = await this.emit(
                    new RoomSetPrivacyEvent(
                        this,
                        message,
                        oldPrivacy,
                        messagePrivacy
                    )
                );

                if (ev.alteredPrivacy !== messagePrivacy) {
                    await this.broadcast([], true, undefined, [
                        new AlterGameMessage(
                            this.code,
                            AlterGameTag.ChangePrivacy,
                            ev.alteredPrivacy === "public" ? 1 : 0
                        )
                    ]);
                }

                if (ev.alteredPrivacy !== oldPrivacy) {
                    this._setPrivacy(ev.alteredPrivacy);
                }
            }
        });

        this.decoder.on(DataMessage, message => {
            const component = this.netobjects.get(message.netid);

            if (component) {
                const reader = HazelReader.from(message.data);
                component.Deserialize(reader);
            }
        });

        this.decoder.on(RpcMessage, async message => {
            const component = this.netobjects.get(message.netid);

            if (component) {
                try {
                    await component.HandleRpc(message.data);
                } catch (e) {
                    void e;
                }
            }
        });

        this.decoder.on(SpawnMessage, message => {
            const ownerClient = this.players.get(message.ownerid);

            if (message.ownerid > 0 && !ownerClient) {
                return;
            }

            this.spawnPrefab(
                message.spawnType,
                message.ownerid,
                message.flags,
                message.components,
                false,
                false
            );
        });

        this.decoder.on(DespawnMessage, message => {
            const component = this.netobjects.get(message.netid);

            if (component) {
                this._despawnComponent(component);
            }
        });

        this.decoder.on(SceneChangeMessage, async message => {
            const player = this.players.get(message.clientid);

            if (player) {
                if (message.scene === "OnlineGame") {
                    player.inScene = true;

                    const ev = await this.emit(
                        new PlayerSceneChangeEvent(
                            this,
                            player,
                            message
                        )
                    );

                    if (ev.canceled) {
                        player.inScene = false;
                    } else {
                        if (this.amhost) {
                            await this.broadcast(
                                this._getExistingObjectSpawn(),
                                true,
                                player
                            );

                            this.spawnPrefab(
                                SpawnType.Player,
                                player.id,
                                SpawnFlag.IsClientCharacter
                            );

                            this.me?.control?.syncSettings(this.settings);
                        }
                    }
                }
            }
        });

        this.decoder.on(ReadyMessage, message => {
            const player = this.players.get(message.clientid);

            if (player) {
                player.ready();
            }
        });
    }

    destroy() {
        if (this._interval) clearInterval(this._interval);
        this._destroyed = true;
    }

    getNextNetId() {
        this._incr_netid++;

        return this._incr_netid;
    }

    /**
     * The current client in the room.
     */
    get me(): PlayerData<this> | undefined {
        return undefined;
    }

    /**
     * The host of the room.
     */
    get host() {
        return this.players.get(this.hostid);
    }

    /**
     * Whether or not a game has started.
     */
    get started() {
        return this._started;
    }

    get destroyed() {
        return this._destroyed;
    }

    /**
     * Whether or not the current client is the host of the room.
     */
    get amhost() {
        return false;
    }

    async broadcast(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        messages: BaseGameDataMessage[],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reliable: boolean = true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        recipient: PlayerData | number | undefined = undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        payloads: BaseRootMessage[] = []
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
                    const writer = HazelWriter.alloc(0);
                    if (component.Serialize(writer, false)) {
                        this.stream.push(
                            new DataMessage(component.netid, writer.buffer)
                        );
                    }
                    component.dirtyBit = 0;
                }
            }
        }

        const ev = await this.emit(
            new RoomFixedUpdateEvent(
                this,
                this.stream
            )
        );

        if (this.stream.length) {
            const stream = this.stream;
            this.stream = [];

            if (!ev.canceled) await this.broadcast(stream);
        }
    }

    /**
     * Resolve a player by some identifier.
     * @param player The identifier to resolve to a player.
     * @returns The resolved player.
     * @example
     *```typescript
     * // Resolve a player by their clientid.
     * const player = room.resolvePlayer(11013);
     * ```
     */
    resolvePlayer(player: PlayerDataResolvable): PlayerData<this>|undefined {
        const clientid = this.resolvePlayerClientID(player);

        if (clientid === undefined)
            return undefined;

        return this.players.get(clientid);
    }

    /**
     * Resolve a player ID by some identifier.
     * @param player The identifier to resolve to a player ID.
     * @returns The resolved player ID.
     */
    resolvePlayerId(player: PlayerIDResolvable) {
        if (typeof player === "undefined") {
            return undefined;
        }

        if (typeof player === "number") {
            return player;
        }

        return player.playerId;
    }

    /**
     * Resolve a clientid by some identifier.
     * @param player The identifier to resolve to a client ID.
     * @returns The resolved client ID.
     */
    resolvePlayerClientID(player: PlayerDataResolvable) {
        if (typeof player === "undefined") {
            return undefined;
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

        return undefined;
    }

    /**
     * Set the code of the room.
     * @example
     *```typescript
     * room.setCode("ABCDEF");
     * ```
     */
    setCode(code: RoomID): void {
        if (typeof code === "string") {
            return this.setCode(Code2Int(code));
        }

        this.code = code;
    }

    protected _setPrivacy(privacy: PrivacyType) {
        this.privacy = privacy;
    }

    /**
     * Change the the privacy of the room.
     * @param tag The tag to change.
     * @param value The new value of the tag.
     * @example
     *```typescript
     * room.setAlterGameTag(AlterGameTag.ChangePrivacy, 1); // 0 for private, 1 for public.
     * ```
     */
    async setPrivacy(privacy: PrivacyType) {
        const oldPrivacy = this.privacy;
        this._setPrivacy(privacy);

        const ev = await this.emit(
            new RoomSetPrivacyEvent(
                this,
                undefined,
                oldPrivacy,
                privacy
            )
        );

        this._setPrivacy(ev.alteredPrivacy);

        if (ev.alteredPrivacy !== oldPrivacy) {
            await this.broadcast([], true, undefined, [
                new AlterGameMessage(
                    this.code,
                    AlterGameTag.ChangePrivacy,
                    this.privacy === "public" ? 1 : 0
                ),
            ]);
        }
    }

    /**
     * Change the settings of the room. If the host, it will broadcast these changes.
     * @param settings The settings to set to (Can be partial).
     * @example
     *```typescript
     * room.syncSettings({
     *   crewmateVision: 0.5,
     *   votingTime: 120
     * });
     * ```
     */
    setSettings(settings: Partial<AllGameSettings>) {
        this.settings.patch(settings);

        if (this.amhost) {
            if (this.me?.control) {
                this.me.control.syncSettings(this.settings);
            }
        }
    }

    /**
     * Set the host of the room. If the current client is the host, it will conduct required host changes.
     * e.g. Spawning objects if they are not already spawned.
     * @param host The new host of the room.
     */
    async setHost(host: PlayerDataResolvable) {
        const before = this.hostid;
        const resolved_id = this.resolvePlayerClientID(host);

        if (!resolved_id) return;

        this.hostid = resolved_id;

        if (this.amhost) {
            if (!this.lobbybehaviour) {
                this.spawnPrefab(SpawnType.LobbyBehaviour, -2);
            }

            if (!this.gamedata) {
                this.spawnPrefab(SpawnType.GameData, -2);
            }
        }

        if (before !== this.hostid && this.host) {
            await this.host.emit(new PlayerSetHostEvent(this, this.host));
        }
    }

    /**
     * Handle when a client joins the game.
     * @param clientid The ID of the client that joined the game.
     */
    async handleJoin(clientid: number) {
        if (this.players.has(clientid)) return null;

        const player: PlayerData<this> = new PlayerData(this, clientid);
        this.players.set(clientid, player);

        player.emit(new PlayerJoinEvent(this, player));

        return player;
    }

    /**
     * Handle when a client leaves the game.
     * @param resolvable The client that left the game.
     */
    async handleLeave(resolvable: PlayerDataResolvable) {
        const player = this.resolvePlayer(resolvable);

        if (!player)
            return null;

        if (player.playerId !== undefined) {
            if (this.gamedata && this.gamedata.players.get(player.playerId)) {
                this.gamedata.remove(player.playerId);
            }

            if (this.amhost && this.meetinghud) {
                const leftPlayerState = this.meetinghud.voteStates.get(player.playerId);
                if (leftPlayerState) {
                    leftPlayerState.setDead();
                }
                for (const [ , voteState ] of this.meetinghud.voteStates) {
                    const voteStatePlayer = voteState.player;
                    if (voteStatePlayer && voteState.votedForId === player.playerId) {
                        this.meetinghud.clearVote(voteStatePlayer);
                    }
                }
            }
        }

        if (this.votebansystem && this.votebansystem.voted.get(player.id)) {
            this.votebansystem.voted.delete(player.id);
        }

        if (player.control) {
            for (const component of player.control.components) {
                this.despawnComponent(component);
            }
        }

        this.players.delete(player.id);

        this.emit(
            new PlayerLeaveEvent(this, player)
        );

        return player;
    }

    /**
     * Handle when the game is started.
     */
    async handleStart() {
        if (this._started) return;
        this._started = true;

        if (this.amhost) {
            await Promise.all([
                Promise.race([
                    Promise.all(
                        [...this.players.values()].map((player) => {
                            if (player.isReady) {
                                return Promise.resolve();
                            }

                            return new Promise<void>((resolve) => {
                                player.once("player.ready", () => {
                                    resolve();
                                });
                            });
                        })
                    ),
                    sleep(3000),
                ]),
                this.me?.ready(),
            ]);

            const removes = [];
            for (const [clientid, player] of this.players) {
                if (!player.isReady) {
                    await this.handleLeave(player);
                    removes.push(clientid);
                }
            }

            if (removes.length) {
                await this.broadcast(
                    [],
                    true,
                    undefined,
                    removes.map((clientid) => {
                        return new RemovePlayerMessage(
                            this.code,
                            clientid,
                            DisconnectReason.Error
                        );
                    })
                );
            }

            if (this.lobbybehaviour)
                this.despawnComponent(
                    this.lobbybehaviour
                );

            const ship_prefabs = [
                SpawnType.ShipStatus,
                SpawnType.Headquarters,
                SpawnType.PlanetMap,
                SpawnType.AprilShipStatus,
                SpawnType.Airship
            ];

            await this.emit(new RoomGameStartEvent(this));
            this.spawnPrefab(ship_prefabs[this.settings?.map] || 0, -2);
            await this.shipstatus?.selectImpostors();

            for (const [, player] of this.players) {
                this.room.gamedata?.setTasks(player, [1, 2, 3]);
            }
        } else {
            await this.emit(new RoomGameStartEvent(this));
            if (this.me) await this.me.ready();
        }
    }

    /**
     * Start a game.
     */
    async requestStartGame() {
        await this.broadcast([], true, undefined, [new StartGameMessage(this.code)]);
    }

    private async _endGame(reason: GameOverReason) {
        this._started = false;
        this.players.clear();
        for (const [ objid ] of this.players) {
            this.players.delete(objid);
        }
        await this.emit(new RoomGameEndEvent(this, reason));
    }

    /**
     * Handle when the game is ended.
     * @param reason The reason for why the game ended.
     */
    async handleEnd(reason: GameOverReason) {
        await this._endGame(reason);
    }

    /**
     * End the current game.
     */
    async endGame(reason: GameOverReason) {
        // todo: send root EndGame message
        return await this.handleEnd(reason);
    }

    /**
     * Handle a client readying up.
     * @param player The client that readied.
     */
    async handleReady(player: PlayerDataResolvable) {
        const resolved = this.resolvePlayer(player);

        if (resolved) {
            await resolved.ready();
        }
    }

    /**
     * Spawn a component (Not broadcasted to all clients, see {@link Hostable.spawnPrefab}).
     * @param component The component being spawned.
     * @example
     * ```typescript
     * const meetinghud = new MeetingHud(
     *   this,
     *   this.getNextNetId(),
     *   ownerid,
     *   {
     *     dirtyBit: 0,
     *     states: new Map(),
     *   }
     * );
     *
     * this.spawnComponent(meetinghud);
     * ```
     */
    spawnComponent(component: Networkable<any, NetworkableEvents, this>, doAwake = true) {
        if (this.netobjects.get(component.netid)) {
            return;
        }

        if (component instanceof LobbyBehaviour) {
            if (!this.lobbybehaviour) {
                this.lobbybehaviour = component as LobbyBehaviour<this>; // (??)
            }
        }

        if (component instanceof GameData) {
            if (!this.gamedata) {
                this.gamedata = component;
            }
        }

        if (component instanceof InnerShipStatus) {
            if (!this.shipstatus) {
                this.shipstatus = component;
            }
        }

        if (component instanceof VoteBanSystem) {
            this.votebansystem = component;
        }

        if (component instanceof MeetingHud) {
            this.meetinghud = component;
        }

        if (doAwake) {
            component.Awake();
        }
        this.netobjects.set(component.netid, component);

        component.emit(
            new ComponentSpawnEvent(this, component)
        );
    }

    private _despawnComponent(component: Networkable<any>) {
        this.netobjects.delete(component.netid);

        if (component.owner instanceof PlayerData) {
            if (component.owner.character === component) {
                component.owner.character = undefined;
            }
        }

        if (component === this.lobbybehaviour) {
            this.lobbybehaviour = undefined;
        }

        if (component === this.gamedata) {
            this.gamedata = undefined;
        }

        if (component === this.shipstatus) {
            this.shipstatus = undefined;
        }

        if (component === this.votebansystem) {
            this.votebansystem = undefined;
        }

        if (component === this.meetinghud) {
            this.meetinghud = undefined;
        }

        component.Despawn();
        component.components.splice(
            component.components.indexOf(component),
            1
        );

        component.emit(
            new ComponentDespawnEvent(this, component)
        );
    }

    /**
     * Despawn a component.
     * @param component The component being despawned.
     * @example
     *```typescript
     * room.despawnComponent(room.meetinghud);
     * ```
     */
    despawnComponent(component: Networkable<any, NetworkableEvents, this>) {
        this._despawnComponent(component);

        this.stream.push(new DespawnMessage(component.netid));
    }

    /**
     * Get an available player ID.
     * @returns The player ID that was found.
     * @example
     *```typescript
     * // Get an available player ID and add it to the gamedata.
     * const playerId = room.getAvailablePlayerID();
     * room.gamedata.add(playerId);
     * ```
     */
    getAvailablePlayerID() {
        for (let i = 1; ; i++) {
            if (!this.getPlayerByPlayerId(i)) {
                return i;
            }
        }
    }

    /**
     * Spawn a prefab of an object.
     * @param spawnType The type of object to spawn.
     * @param owner The owner or ID of the owner of the object to spawn.
     * @returns The object that was spawned.
     * @example
     *```typescript
     * room.spawnPrefab(SpawnType.Player, client.me);
     * ```
     */
    spawnPrefab(spawnType: number, ownerid: number|{ id: number }, flags?: number, componentData: ComponentSpawnData[] = [], doBroadcast = true, doAwake = true) {
        const _ownerid = typeof ownerid === "number" ? ownerid : ownerid.id;
        const ownerClient = this.players.get(_ownerid);
        const _flags = flags ?? (spawnType === SpawnType.Player ? SpawnFlag.IsClientCharacter : 0);

        let object!: Networkable;

        const spawnPrefab = this.spawnPrefabs[spawnType];

        for (let i = 0; i < spawnPrefab.length; i++) {
            const component = new spawnPrefab[i](
                this,
                spawnType,
                componentData[i]?.netid || this.getNextNetId(),
                _ownerid,
                _flags,
                undefined,
                object
            );

            this._incr_netid = component.netid;
            if (this.netobjects.get(component.netid))
                continue;

            if (i === 0) {
                object = component;
                this.objectList.push(object);
            }

            if (componentData[i]?.data) {
                const reader = HazelReader.from(componentData[i].data);
                component.Deserialize(reader, true);
            }

            this.spawnComponent(component as Networkable<any, NetworkableEvents, this>, doAwake);
            object.components.push(component);
        }

        if (spawnType === SpawnType.Player && ownerClient) {
            ownerClient.emit(
                new PlayerSpawnEvent(
                    this,
                    ownerClient
                )
            );
        }

        if (this.amhost && doBroadcast) {
            this.stream.push(
                new SpawnMessage(
                    spawnType,
                    object.ownerid,
                    _flags,
                    object.components.map((component) => {
                        const writer = HazelWriter.alloc(0);
                        writer.write(component, true);
    
                        return new ComponentSpawnData(
                            component.netid,
                            writer.buffer
                        );
                    })
                )
            );
        }

        if ((_flags & SpawnFlag.IsClientCharacter) > 0 && ownerClient) {
            if (!ownerClient.character) {
                ownerClient.character = object as PlayerControl<this>;
                ownerClient.inScene = true;
            }
        }

        return object;
    }

    registerPrefab(spawnType: number, components: NetworkableConstructor<Networkable>[]) {
        this.spawnPrefabs[spawnType] = components;
    }

    /**
     * Get a player by their player ID.
     * @param playerId The player ID of the player.
     * @returns The player that was found, or null if they do not exist.
     * @example
     * ```typescript
     * const player = room.getPlayerByPlayerId(1);
     * ```
     */
    getPlayerByPlayerId(playerId: number): PlayerData<this>|undefined {
        for (const [, player] of this.players) {
            if (player.playerId === playerId)
                return player;
        }

        return undefined;
    }

    /**
     * Get a player by one of their components' netids.
     * @param netid The network ID of the component of the player to search.
     * @returns The player that was found, or null if they do not exist.
     * @example
     * ```typescript
     * const player = room.getPlayerByNetId(34);
     * ```
     */
    getPlayerByNetId(netid: number) {
        for (const [, player] of this.players) {
            if (!player.control)
                continue;

            if (player.control.components.find(component => component.netid === netid)) {
                return player;
            }
        }

        return undefined;
    }

    private _getExistingObjectSpawn() {
        const messages: SpawnMessage[] = [];

        for (const object of this.objectList) {
            messages.push(
                new SpawnMessage(
                    object.spawnType,
                    object.ownerid,
                    object.flags,
                    object.components.map(component => {
                        const writer = HazelWriter.alloc(512);
                        writer.write(component, true);
                        writer.realloc(writer.cursor);

                        return new ComponentSpawnData(component.netid, writer.buffer);
                    })
                )
            );
        }

        return messages;
    }

    /**
     * How often a FixedUpdate should be called.
     */
    static FixedUpdateInterval = 1 / 50;
}
