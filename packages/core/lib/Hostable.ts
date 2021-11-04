import {
    SpawnMessage,
    GameSettings,
    BaseGameDataMessage,
    BaseRootMessage,
    DataMessage,
    AlterGameMessage,
    RemovePlayerMessage,
    DespawnMessage,
    ComponentSpawnData,
    PacketDecoder,
    AllGameSettings,
    EndGameMessage
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
    SpawnFlag,
    GameState
} from "@skeldjs/constant";

import { EventEmitter, ExtractEventTypes } from "@skeldjs/events";

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

import { Networkable, NetworkableEvents, NetworkableConstructor } from "./Networkable";
import { PlayerData, PlayerDataEvents } from "./PlayerData";

import { HostableOptions } from "./misc/HostableOptions";

import {
    ComponentDespawnEvent,
    ComponentSpawnEvent,
    PlayerJoinEvent,
    PlayerLeaveEvent,
    PlayerSetHostEvent,
    PlayerSpawnEvent,
    RoomEndGameIntentEvent,
    RoomFixedUpdateEvent,
    RoomGameEndEvent,
    RoomGameStartEvent,
    RoomSelectImpostorsEvent,
    RoomSetPrivacyEvent
} from "./events";

import { AmongUsEndGames, EndGameIntent, PlayersDisconnectEndgameMetadata } from "./endgame";

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

export type HostableEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> &
    PlayerDataEvents<RoomType> &
    GameDataEvents<RoomType> &
    LobbyBehaviourEvents<RoomType> &
    MeetingHudEvents<RoomType> &
    ShipStatusEvents<RoomType> &
    VoteBanSystemEvents<RoomType> &
    ExtractEventTypes<
        [
            RoomEndGameIntentEvent<RoomType>,
            RoomFixedUpdateEvent<RoomType>,
            RoomGameEndEvent<RoomType>,
            RoomGameStartEvent<RoomType>,
            RoomSelectImpostorsEvent<RoomType>,
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
> extends EventEmitter<T> {

    /**
     * Whether or not this room has been destroyed.
     */
    protected _destroyed: boolean;

    protected last_fixed_update: number;

    protected _interval?: NodeJS.Timeout;

    protected _incr_netid: number;

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

    /**
     * The current message stream to be sent to the server on fixed update.
     */
    stream: BaseGameDataMessage[];

    /**
     * The code of the room.
     */
    code: number;

    /**
     * The state that the game is currently in.
     */
    state: GameState;

    /**
     * The ID of the host of the room.
     */
    hostId: number;

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

    /**
     * An instance of the ship status in the room. Spawned when a game is started
     * and represents the current map.
     *
     * It is possible for more than one ship status to be spawned, however this
     * property is set and cleared for simplicity.
     *
     * See {@link Hostable.objectList} if you're looking to find all ship status
     * objects that have been spawned.
     */
    shipStatus: InnerShipStatus<this>|undefined;

    /**
     * An instance of the meeting hud in the room. Spawned when a meeting is
     * started.
     *
     * It is possible for more than one meeting hud to be spawned, however this
     * property is set and cleared for simplicity.
     *
     * See {@link Hostable.objectList} if you're looking to find all meeting hud
     * objects that have been spawned.
     */
    meetingHud: MeetingHud<this>|undefined;

    /**
     * An instance of the lobby behaviour in the room. Spawned when the room is
     * currently in the lobby waiting for a game to start.
     *
     * It is possible for more than one lobby behaviour to be spawned, however this
     * property is set and cleared for simplicity.
     *
     * See {@link Hostable.objectList} if you're looking to find all lobby behaviour
     * objects that have been spawned.
     */
    lobbyBehaviour: LobbyBehaviour<this>|undefined;

    /**
     * An instance of the game data in the room. Contains information about players
     * such as their name, colour, hat etc.
     *
     * It is possible for more than one game data to be spawned, however this
     * property is set and cleared for simplicity.
     *
     * See {@link Hostable.objectList} if you're looking to find all game data
     * objects that have been spawned.
     */
    gameData: GameData<this>|undefined;

    /**
     * An instance of the voting ban system in the room. Used as a utility object
     * for handling kick and ban votes.
     *
     * It is possible for more than one vote ban system to be spawned, however this
     * property is set and cleared for simplicity.
     *
     * See {@link Hostable.objectList} if you're looking to find all vote ban system
     * objects that have been spawned.
     */
    voteBanSystem: VoteBanSystem<this>|undefined;

    /**
     * A map of spawn type -> objects used in the protocol. Useful to register
     * custom INO (inner net objects) such as replicating behaviour from a client
     * mod, see {@link Hostable.registerPrefab}.
     */
    spawnPrefabs: Map<number, NetworkableConstructor<any>[]> = new Map([
        [SpawnType.ShipStatus, [ SkeldShipStatus ]],
        [SpawnType.MeetingHud, [ MeetingHud ]],
        [SpawnType.LobbyBehaviour, [ LobbyBehaviour ]],
        [SpawnType.GameData, [ GameData, VoteBanSystem ]],
        [SpawnType.Player, [ PlayerControl, PlayerPhysics, CustomNetworkTransform ]],
        [SpawnType.Headquarters, [ MiraShipStatus ]],
        [SpawnType.PlanetMap, [ PolusShipStatus ]],
        [SpawnType.AprilShipStatus, [ AprilShipStatus ]],
        [SpawnType.Airship, [ AirshipStatus ]]
    ]);

    /**
     * Every end game intent that should happen in a queue to be or not to be
     * canceled.
     *
     * The first item of each element being the name of the end game intent and
     * the second being metadata passed with it.
     *
     * See {@link RoomEndGameIntentEvent} to cancel an end game intent, or see
     * {@link Hostable.registerEndGameIntent} to register your own.
     *
     * See {@link RoomGameEndEvent} to listen for a game actually ending.
     */
    endGameIntents: EndGameIntent<any>[];

    constructor(public options: HostableOptions = {}) {
        super();

        this.last_fixed_update = Date.now();
        this._incr_netid = 0;
        this._destroyed = false;

        this.code = 0;
        this.state = GameState.NotStarted;
        this.hostId = -1;
        this.counter = -1;
        this.privacy = "private";

        this.settings = new GameSettings;

        this.objectList = [];
        this.players = new Map;
        this.netobjects = new Map;
        this.stream = [];

        this.decoder = new PacketDecoder;

        this.shipStatus = undefined;
        this.meetingHud = undefined;
        this.lobbyBehaviour = undefined;
        this.gameData = undefined;
        this.voteBanSystem = undefined;

        this.endGameIntents = [];

        if (options.doFixedUpdate) {
            this._interval = setInterval(
                () => this.FixedUpdate(),
                Hostable.FixedUpdateInterval
            );
        }
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
    get myPlayer(): PlayerData<this> | undefined {
        return undefined;
    }

    /**
     * The host of the room.
     */
    get host() {
        return this.players.get(this.hostId);
    }

    get destroyed() {
        return this._destroyed;
    }

    /**
     * Whether or not the current client is the host of the room.
     */
    get hostIsMe() {
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
                (component.ownerId === this.myPlayer?.clientId || this.hostIsMe)
            ) {
                component.FixedUpdate(delta / 1000);
                if (component.dirtyBit) {
                    component.PreSerialize();
                    const writer = HazelWriter.alloc(0);
                if (component.Serialize(writer, false)) {
                        this.stream.push(
                            new DataMessage(component.netId, writer.buffer)
                        );
                    }
                    component.dirtyBit = 0;
                }
            }
        }

        if (this.endGameIntents.length) {
            const endGameIntents = this.endGameIntents;
            this.endGameIntents = [];
            if (this.hostIsMe) {
                for (let i = 0; i < endGameIntents.length; i++) {
                    const intent = endGameIntents[i];
                    const ev = await this.emit(
                        new RoomEndGameIntentEvent(
                            this,
                            intent.name,
                            intent.reason,
                            intent.metadata
                        )
                    );
                    if (ev.canceled) {
                        endGameIntents.splice(i, 1);
                        i--;
                    }
                }

                if (endGameIntents[0]) {
                    this.endGame(endGameIntents[0].reason);
                }
            }
        }

        const ev = await this.emit(
            new RoomFixedUpdateEvent(
                this,
                this.stream,
                delta
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
        if (player instanceof PlayerData)
            return player as PlayerData<this>;

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
            return player.ownerId;
        }

        if (player instanceof PlayerData) {
            return player.clientId;
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

        if (this.hostIsMe && this.host && this.host.control) {
            this.host.control.syncSettings(this.settings);
        }
    }

    async spawnNecessaryObjects() {
        if (!this.lobbyBehaviour && this.state === GameState.NotStarted) {
            this.spawnPrefab(SpawnType.LobbyBehaviour, -2);
        }

        if (!this.shipStatus && this.state === GameState.Started) {
            const shipPrefabs = [
                SpawnType.ShipStatus,
                SpawnType.Headquarters,
                SpawnType.PlanetMap,
                SpawnType.AprilShipStatus,
                SpawnType.Airship
            ];

            this.spawnPrefab(shipPrefabs[this.settings?.map] || 0, -2);
        }

        if (!this.gameData) {
            this.spawnPrefab(SpawnType.GameData, -2);
        }
    }

    /**
     * Set the host of the room. If the current client is the host, it will conduct required host changes.
     * e.g. Spawning objects if they are not already spawned.
     * @param host The new host of the room.
     */
    async setHost(host: PlayerDataResolvable) {
        const before = this.hostId;
        const resolvedId = this.resolvePlayerClientID(host);

        if (!resolvedId) return;

        this.hostId = resolvedId;

        if (this.hostIsMe) {
            await this.spawnNecessaryObjects();
        }

        if (before !== this.hostId && this.host) {
            await this.host.emit(new PlayerSetHostEvent(this, this.host));
        }
    }

    /**
     * Handle when a client joins the game.
     * @param clientid The ID of the client that joined the game.
     */
    async handleJoin(clientid: number) {
        if (this.players.has(clientid))
            return null;

        const player: PlayerData<this> = new PlayerData(this, clientid);
        this.players.set(clientid, player);

        if (this.hostIsMe) {
            await this.spawnNecessaryObjects();
        }

        await player.emit(new PlayerJoinEvent(this, player));

        return player;
    }

    checkPlayersRemaining() {
        if (!this.gameData || !this.shipStatus)
            return;

        let aliveImpostors = 0;
        let totalImpostors = 0;
        let totalCrewmates = 0;
        for (const [ , playerInfo ] of this.gameData.players) {
            if (!playerInfo.isDisconnected)
            {
                if (playerInfo.isImpostor)
                {
                    totalImpostors++;
                } else {
                    totalCrewmates++;
                }

                if (!playerInfo.isDead)
                {
                    if (playerInfo.isImpostor)
                    {
                        aliveImpostors++;
                    }
                }
            }
        }

        const reason = totalImpostors === 0
            ? GameOverReason.ImpostorDisconnect
            : totalCrewmates <= aliveImpostors
                ? GameOverReason.HumansDisconnect
                : -1;

        if (reason !== -1) {
            this.registerEndGameIntent(
                new EndGameIntent<PlayersDisconnectEndgameMetadata>(
                    AmongUsEndGames.PlayersDisconnect,
                    reason,
                    {
                        aliveImpostors,
                        totalImpostors,
                        totalCrewmates
                    }
                )
            );
        }
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
            if (this.state === GameState.Started) {
                const gamedataEntry = this.gameData?.players.get(player.playerId);
                if (gamedataEntry) {
                    gamedataEntry.setDisconnected(true);
                }

                this.checkPlayersRemaining();
            } else {
                this.gameData?.players.delete(player.playerId);
            }

            if (this.hostIsMe && this.meetingHud) {
                for (const [ , voteState ] of this.meetingHud.voteStates) {
                    const voteStatePlayer = voteState.player;
                    if (voteStatePlayer && voteState.votedForId === player.playerId) {
                        this.meetingHud.clearVote(voteStatePlayer);
                    }
                }
            }
        }

        if (this.voteBanSystem && this.voteBanSystem.voted.get(player.clientId)) {
            this.voteBanSystem.voted.delete(player.clientId);
        }

        if (player.control) {
            for (const component of player.control.components) {
                this.despawnComponent(component);
            }
        }

        this.players.delete(player.clientId);

        this.emit(new PlayerLeaveEvent(this, player));

        return player;
    }

    /**
     * Handle when the game is started.
     */
    async handleStart() {
        if (this.state === GameState.Started)
            return;

        this.state = GameState.Started;

        if (this.hostIsMe) {
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
                this.myPlayer?.ready(),
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

            if (this.lobbyBehaviour)
                this.lobbyBehaviour.despawn();

            const shipPrefabs = [
                SpawnType.ShipStatus,
                SpawnType.Headquarters,
                SpawnType.PlanetMap,
                SpawnType.AprilShipStatus,
                SpawnType.Airship
            ];

            await this.emit(new RoomGameStartEvent(this));
            this.spawnPrefab(shipPrefabs[this.settings?.map] || 0, -2);
            await this.shipStatus?.selectImpostors();
            await this.shipStatus?.assignTasks();

            if (this.shipStatus) {
                for (const [ , player ] of this.players) {
                    this.shipStatus.spawnPlayer(player, true);
                }
            }
        } else {
            await this.emit(new RoomGameStartEvent(this));
            await this.myPlayer?.ready();
        }
    }

    protected async _handleEnd(reason: GameOverReason) {
        this.state = GameState.Ended;
        this.players.clear();
        for (const [ objid ] of this.players) {
            this.players.delete(objid);
        }
        if (this.hostIsMe) {
            for (const [ , component ] of this.netobjects) {
                component.despawn();
            }
        }
        await this.emit(new RoomGameEndEvent(this, reason));
    }

    /**
     * Handle when the game is ended.
     * @param reason The reason for why the game ended.
     */
    async handleEnd(reason: GameOverReason) {
        await this._handleEnd(reason);
    }

    async endGame(reason: GameOverReason) {
        if (this.state !== GameState.Started)
            return;

        this.state = GameState.Ended;
        await this.broadcast([], true, undefined, [
            new EndGameMessage(this.code, reason, false)
        ]);
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
    spawnComponent(component: Networkable<any, NetworkableEvents, this>) {
        if (this.netobjects.get(component.netId)) {
            return;
        }

        if (component instanceof LobbyBehaviour) {
            if (!this.lobbyBehaviour) {
                this.lobbyBehaviour = component as LobbyBehaviour<this>; // (??)
            }
        }

        if (component instanceof GameData) {
            if (!this.gameData) {
                this.gameData = component;
            }
        }

        if (component instanceof InnerShipStatus) {
            if (!this.shipStatus) {
                this.shipStatus = component;
            }
        }

        if (component instanceof VoteBanSystem) {
            this.voteBanSystem = component;
        }

        if (component instanceof MeetingHud) {
            this.meetingHud = component;
        }

        this.netobjects.set(component.netId, component);

        component.emit(
            new ComponentSpawnEvent(this, component)
        );
    }

    protected _despawnComponent(component: Networkable<any>) {
        this.netobjects.delete(component.netId);

        if (component.owner instanceof PlayerData) {
            if (component.owner.character === component) {
                component.owner.character = undefined;
            }
        }

        if (component === this.lobbyBehaviour) {
            this.lobbyBehaviour = undefined;
        }

        if (component === this.gameData) {
            this.gameData = undefined;
        }

        if (component === this.shipStatus) {
            this.shipStatus = undefined;
        }

        if (component === this.voteBanSystem) {
            this.voteBanSystem = undefined;
        }

        if (component === this.meetingHud) {
            this.meetingHud = undefined;
        }

        component.Destroy();

        const objectIdx = this.objectList.indexOf(component);

        if (objectIdx > -1) {
            this.objectList.splice(objectIdx, 1);
        }

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

        this.stream.push(new DespawnMessage(component.netId));
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
        if (!this.gameData)
            return 0;

        for (let i = 0; ; i++) {
            if (!this.gameData.players.get(i)) {
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
    spawnPrefab(
        spawnType: number,
        ownerId: number|PlayerData|undefined,
        flags?: number,
        componentData: (any|ComponentSpawnData)[] = [],
        doBroadcast = true,
        doAwake = true
    ): Networkable<any, any, this>|undefined {
        const _ownerid =
            ownerId === undefined
                ? -2
                : typeof ownerId === "number" ? ownerId : ownerId.clientId;

        const ownerClient = this.players.get(_ownerid);
        const _flags = flags ?? (spawnType === SpawnType.Player ? SpawnFlag.IsClientCharacter : 0);

        let object!: Networkable;

        const spawnPrefab = this.spawnPrefabs.get(spawnType);

        if (!spawnPrefab)
            throw new Error("Cannot spawn object of type: " + spawnType + " (not registered)");

        for (let i = 0; i < spawnPrefab.length; i++) {
            const component = new spawnPrefab[i](
                this,
                spawnType,
                componentData[i]?.netid || this.getNextNetId(),
                _ownerid,
                _flags,
                componentData[i] instanceof ComponentSpawnData
                    ? HazelReader.from(componentData[i].data)
                    : componentData[i],
                object
            );

            this._incr_netid = component.netId;
            if (this.netobjects.get(component.netId))
                continue;

            if (!object) {
                object = component;
                this.objectList.push(object);
            }

            this.spawnComponent(component as Networkable<any, NetworkableEvents, this>);
            object.components.push(component);
        }

        if (!object)
            return;

        for (const component of object.components) {
            if (doAwake) {
                component.Awake();
            }
        }

        if (spawnType === SpawnType.Player && ownerClient) {
            ownerClient.emit(
                new PlayerSpawnEvent(
                    this,
                    ownerClient
                )
            );
        }

        if (this.hostIsMe && doBroadcast) {
            this.stream.push(
                new SpawnMessage(
                    spawnType,
                    object.ownerId,
                    _flags,
                    object.components.map((component) => {
                        const writer = HazelWriter.alloc(0);
                        writer.write(component, true);

                        return new ComponentSpawnData(
                            component.netId,
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

        return object as Networkable<any, any, this>;
    }

    /**
     * Create a fake player in the room that doesn't need a client to be connected
     * to own it.
     *
     * To dispose of the player, use `player.despawn()`.
     * @param isNew Whether or not the player should be seen jumping off of the seat in the lobby.
     * @returns The fake player created.
     */
    createFakePlayer(isNew = true): PlayerData<this> {
        const player = new PlayerData(this, 0);
        const playerControl = this.spawnPrefab(SpawnType.Player, -2, undefined, !isNew ? [{ isNew: false }] : undefined) as PlayerControl<this>;
        playerControl.player = player;
        player.character = playerControl;

        return player;
    }

    /**
     * Register a custom INO spawn object by its spawn type. Can also override
     * built-in objects.
     * @param spawnType The spawn type of the component as an integer.
     * @param components The components in the object. The first component should
     * be the main object which will inherit the rest of the components.
     */
    registerPrefab(spawnType: number, components: NetworkableConstructor<Networkable>[]) {
        if (components.length < 1) {
            throw new Error("Expected at least 1 component to create an INO prefab from.");
        }

        this.spawnPrefabs.set(spawnType, components);
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
        return this.getPlayerControlByPlayerId(playerId)?.player;
    }

    getPlayerControlByPlayerId(playerId: number): PlayerControl<this>|undefined {
        for (let i = 0; i < this.objectList.length; i++) {
            const object = this.objectList[i];
            if (object instanceof PlayerControl) {
                if (object.playerId === playerId) {
                    return object;
                }
            }
        }

        return undefined;
    }

    /**
     * Get a player by one of their components' netids.
     * @param netid The net ID of the component of the player to search.
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

            if (player.control.components.find(component => component.netId === netid)) {
                return player;
            }
        }

        return undefined;
    }

    /**
     * Register an intent to end the game.
     * @param endGameIntent The intention to end the game.
     */
    registerEndGameIntent(endGameIntent: EndGameIntent<any>) {
        this.endGameIntents.push(endGameIntent);
    }

    protected _getExistingObjectSpawn() {
        const messages: SpawnMessage[] = [];

        for (const object of this.objectList) {
            messages.push(
                new SpawnMessage(
                    object.spawnType,
                    object.ownerId,
                    object.flags,
                    object.components.map(component => {
                        const writer = HazelWriter.alloc(512);
                        writer.write(component, true);
                        writer.realloc(writer.cursor);

                        return new ComponentSpawnData(component.netId, writer.buffer);
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
