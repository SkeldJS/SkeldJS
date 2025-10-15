import {
    SpawnMessage,
    GameSettings,
    BaseGameDataMessage,
    BaseRootMessage,
    DataMessage,
    DespawnMessage,
    ComponentSpawnData,
    AllGameSettings,
    PlayerJoinData
} from "@skeldjs/protocol";

import { HazelWriter } from "@skeldjs/hazel";

import {
    GameOverReason,
    SpawnType,
    SpawnFlag,
    GameState,
    RoleType,
    RoleTeamType,
    GameMode,
    GameMap,
    SystemType
} from "@skeldjs/constant";

import { EventEmitter, ExtractEventTypes } from "@skeldjs/events";

import { NetworkedObject, NetworkedObjectEvents, NetworkedObjectConstructor } from "./NetworkedObject";

import {
    AirshipStatus,
    AprilShipStatus,
    CustomNetworkTransform,
    FungleShipStatus,
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
    InnerShipStatus,
    HideAndSeekManager,
    NormalGameManager,
    InnerGameManager,
    NetworkedPlayerInfo,
} from "./objects";

import { Player, PlayerEvents } from "./Player";

import {
    ComponentDespawnEvent,
    ComponentSpawnEvent,
    PlayerJoinEvent,
    PlayerLeaveEvent,
    PlayerSetAuthoritativeEvent,
    PlayerSpawnEvent,
    RoomEndGameIntentEvent,
    RoomFixedUpdateEvent,
    RoomGameEndedEvent,
    RoomGameStartedEvent
} from "./events";

import { AmongUsEndGames, EndGameIntent, PlayersDisconnectEndgameMetadata } from "./endgame";

import {
    BaseRole,
    CrewmateGhostRole,
    ImpostorGhostRole,
    CrewmateRole,
    DetectiveRole,
    EngineerRole,
    GuardianAngelRole,
    ImpostorRole,
    NoisemakerRole,
    PhantomRole,
    ScientistRole,
    ShapeshifterRole,
    TrackerRole,
    ViperRole,
} from "./roles";

import { setTimeoutPromise } from "./utils/setTimeoutPromise";

export type RoomID = string | number;

export enum SpecialOwnerId {
    Global = -2,
    /**
     * Only used internally, not by SkeldJS
     */
    CurrentClient = -3,
    Server = -4,
}

export type PlayerResolvable<RoomType extends StatefulRoom = StatefulRoom> =
    | number
    | Player<RoomType>
    | PlayerControl<RoomType>
    | PlayerPhysics<RoomType>
    | CustomNetworkTransform<RoomType>;

export type StatefulRoomConfig = {
    /**
     * Whether or not to do a fixed update interval.
     * @default false
     */
    doFixedUpdate?: boolean;
}

export type AnyNetworkedObject<RoomType extends StatefulRoom> =
    | AirshipStatus<RoomType>
    | AprilShipStatus<RoomType>
    | CustomNetworkTransform<RoomType>
    | MiraShipStatus<RoomType>
    | LobbyBehaviour<RoomType>
    | MeetingHud<RoomType>
    | PolusShipStatus<RoomType>
    | PlayerControl<RoomType>
    | PlayerPhysics<RoomType>
    | SkeldShipStatus<RoomType>
    | VoteBanSystem<RoomType>;

export type StatefulRoomEvents<RoomType extends StatefulRoom> = NetworkedObjectEvents<RoomType> &
    PlayerEvents<RoomType> &
    LobbyBehaviourEvents<RoomType> &
    MeetingHudEvents<RoomType> &
    ShipStatusEvents<RoomType> &
    VoteBanSystemEvents<RoomType> &
    ExtractEventTypes<
        [
            RoomEndGameIntentEvent<RoomType>,
            RoomFixedUpdateEvent<RoomType>,
            RoomGameEndedEvent<RoomType>,
            RoomGameStartedEvent<RoomType>
        ]
    >;

/**
 * Represents an object capable of hosting games.
 *
 * See {@link StatefulRoomEvents} for events to listen to.
 */
export abstract class StatefulRoom<T extends StatefulRoomEvents<StatefulRoom> = any> extends EventEmitter<T> {

    /**
     * Whether or not this room has been destroyed.
     */
    destroyed: boolean;

    lastFixedUpdateTimestamp: number;

    fixedUpdateInterval?: NodeJS.Timeout;

    lastNetId: number;

    /**
     * A list of all objects in the room.
     */
    objectList: NetworkedObject<this>[];

    /**
     * The players in the room.
     */
    players: Map<number, Player<this>>;

    /**
     * The networked components in the room.
     */
    networkedObjects: Map<number, NetworkedObject<this>>;

    /**
     * The current message stream to be sent to the server on fixed update.
     */
    messageStream: BaseGameDataMessage[];

    /**
     * The state that the game is currently in.
     */
    gameState: GameState;

    /**
     * The ID of the host of the room.
     */
    authorityId: number;

    /**
     * The settings of the room.
     */
    settings: GameSettings;

    /**
     * The current start counter for the room.
     */
    startGameCounter: number;

    /**
     * An instance of the ship status in the room. Spawned when a game is started
     * and represents the current map.
     *
     * It is possible for more than one ship status to be spawned, however this
     * property is set and cleared for simplicity.
     *
     * See {@link StatefulRoom.objectList} if you're looking to find all ship status
     * objects that have been spawned.
     */
    shipStatus: InnerShipStatus<this> | undefined;

    /**
     * An instance of the meeting hud in the room. Spawned when a meeting is
     * started.
     *
     * It is possible for more than one meeting hud to be spawned, however this
     * property is set and cleared for simplicity.
     *
     * See {@link StatefulRoom.objectList} if you're looking to find all meeting hud
     * objects that have been spawned.
     */
    meetingHud: MeetingHud<this> | undefined;

    /**
     * An instance of the lobby behaviour in the room. Spawned when the room is
     * currently in the lobby waiting for a game to start.
     *
     * It is possible for more than one lobby behaviour to be spawned, however this
     * property is set and cleared for simplicity.
     *
     * See {@link StatefulRoom.objectList} if you're looking to find all lobby behaviour
     * objects that have been spawned.
     */
    lobbyBehaviour: LobbyBehaviour<this> | undefined;

    gameManager: InnerGameManager<this> | undefined;

    /**
     * An instance of the voting ban system in the room. Used as a utility object
     * for handling kick and ban votes.
     *
     * It is possible for more than one vote ban system to be spawned, however this
     * property is set and cleared for simplicity.
     *
     * See {@link StatefulRoom.objectList} if you're looking to find all vote ban system
     * objects that have been spawned.
     */
    voteBanSystem: VoteBanSystem<this> | undefined;

    playerInfo: Map<number, NetworkedPlayerInfo<this>>;

    /**
     * A map of spawn type -> objects used in the protocol. Useful to register
     * custom INO (inner net objects) such as replicating behaviour from a client
     * mod, see {@link StatefulRoom.registerPrefab}.
     */
    registeredPrefabs: Map<number, NetworkedObjectConstructor<any>[]>;

    shipPrefabIds: Map<number, number>;

    /**
     * All roles that can be assigned to players. See {@link StatefulRoom.registerRole}.
     */
    registeredRoles: Map<number, typeof BaseRole>;

    /**
     * Every end game intent that should happen in a queue to be or not to be
     * canceled.
     *
     * The first item of each element being the name of the end game intent and
     * the second being metadata passed with it.
     *
     * See {@link RoomEndGameIntentEvent} to cancel an end game intent, or see
     * {@link StatefulRoom.registerEndGameIntent} to register your own.
     *
     * See {@link RoomGameEndedEvent} to listen for a game actually ending.
     */
    endGameIntents: EndGameIntent<any>[];

    constructor(public config: StatefulRoomConfig = {}) {
        super();

        this.lastFixedUpdateTimestamp = Date.now();
        this.lastNetId = 0;
        this.destroyed = false;

        this.gameState = GameState.NotStarted;
        this.authorityId = -1;
        this.startGameCounter = -1;

        this.settings = new GameSettings;

        this.objectList = [];
        this.players = new Map;
        this.networkedObjects = new Map;
        this.messageStream = [];

        this.shipStatus = undefined;
        this.meetingHud = undefined;
        this.lobbyBehaviour = undefined;
        this.gameManager = undefined;
        this.voteBanSystem = undefined;

        this.playerInfo = new Map;

        this.registeredPrefabs = new Map([
            [SpawnType.SkeldShipStatus, [SkeldShipStatus]],
            [SpawnType.MeetingHud, [MeetingHud]],
            [SpawnType.LobbyBehaviour, [LobbyBehaviour]],
            [SpawnType.Player, [PlayerControl, PlayerPhysics, CustomNetworkTransform]],
            [SpawnType.MiraShipStatus, [MiraShipStatus]],
            [SpawnType.PolusShipStatus, [PolusShipStatus]],
            [SpawnType.AprilShipStatus, [AprilShipStatus]],
            [SpawnType.AirshipShipStatus, [AirshipStatus]],
            [SpawnType.HideAndSeekManager, [HideAndSeekManager]],
            [SpawnType.NormalGameManager, [NormalGameManager]],
            [SpawnType.PlayerInfo, [NetworkedPlayerInfo]], // TODO
            [SpawnType.VoteBanSystem, [VoteBanSystem]],
            [SpawnType.FungleShipStatus, [ FungleShipStatus ]], // TODO
        ]);

        this.shipPrefabIds = new Map([
            [GameMap.TheSkeld, SpawnType.SkeldShipStatus],
            [GameMap.MiraHQ, SpawnType.MiraShipStatus],
            [GameMap.Polus, SpawnType.PolusShipStatus],
            [GameMap.AprilFoolsTheSkeld, SpawnType.AprilShipStatus],
            [GameMap.Airship, SpawnType.AirshipShipStatus],
            [GameMap.Fungle, SpawnType.FungleShipStatus],
        ])

        this.registeredRoles = new Map([
            [RoleType.Crewmate, CrewmateRole],
            [RoleType.Impostor, ImpostorRole],
            [RoleType.Scientist, ScientistRole],
            [RoleType.Engineer, EngineerRole],
            [RoleType.GuardianAngel, GuardianAngelRole],
            [RoleType.Shapeshifter, ShapeshifterRole],
            [RoleType.CrewmateGhost, CrewmateGhostRole],
            [RoleType.ImpostorGhost, ImpostorGhostRole],
            [RoleType.Noisemaker, NoisemakerRole],
            [RoleType.Phantom, PhantomRole],
            [RoleType.Tracker, TrackerRole],
            [RoleType.Detective, DetectiveRole],
            [RoleType.Viper, ViperRole],
        ]);

        this.endGameIntents = [];

        if (config.doFixedUpdate) {
            this.fixedUpdateInterval = setInterval(
                () => this.processFixedUpdate(),
                StatefulRoom.processFixedUpdateInterval
            );
        }
    }

    destroy() {
        if (this.fixedUpdateInterval)
            clearInterval(this.fixedUpdateInterval);
        this.fixedUpdateInterval = undefined;
        this.destroyed = true;
        this.gameState = GameState.Destroyed;
    }

    getNextNetId() {
        this.lastNetId++;

        return this.lastNetId;
    }

    /**
     * The host of the room.
     */
    get playerAuthority() {
        return this.players.get(this.authorityId);
    }

    /**
     * Whether or not the current client is the host of the room.
     */
    get isAuthoritative() {
        return false;
    }

    /**
     * Whether or not this client/room is able to manage an object, i.e. perform
     * host actions on it.
     * @param object The object to manage.
     * @returns Whether or not the object can be managed by this client/room.
     */
    canManageObject(object: NetworkedObject<this>) {
        return this.isAuthoritative;
    }

    broadcastLazy(gameDataMessage: BaseGameDataMessage) {
        this.messageStream.push(gameDataMessage);
    }

    async broadcastImmediate(
        gamedata: BaseGameDataMessage[],
        payloads: BaseRootMessage[] = [],
        include?: (Player<this> | number)[],
        exclude?: (Player<this> | number)[],
        reliable = true
    ) { }

    async processFixedUpdate() {
        const delta = Date.now() - this.lastFixedUpdateTimestamp;
        this.lastFixedUpdateTimestamp = Date.now();
        for (const [, component] of this.networkedObjects) {
            if (this.canManageObject(component)) {
                await component.processFixedUpdate(delta / 1000);
                if (component.dirtyBit) {
                    const writer = HazelWriter.alloc(0);
                    if (component.serializeToWriter(writer, false)) {
                        this.broadcastLazy(new DataMessage(component.netId, writer.buffer));
                    }
                    component.dirtyBit = 0;
                }
            }
        }

        if (this.endGameIntents.length) {
            const endGameIntents = this.endGameIntents;
            this.endGameIntents = [];
            if (this.isAuthoritative) {
                for (let i = 0; i < endGameIntents.length; i++) {
                    const intent = endGameIntents[i];
                    const ev = await this.emit(new RoomEndGameIntentEvent(
                        this,
                        intent.name,
                        intent.reason,
                        intent.metadata
                    ));

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
                this.messageStream,
                delta / 1000
            )
        );

        if (this.messageStream.length) {
            const stream = this.messageStream;
            this.messageStream = [];

            if (!ev.canceled)
                await this.broadcastImmediate(stream);
        }
    }

    /**
     * Resolve a player by some identifier.
     * @param player The identifier to resolve to a player.
     * @returns The resolved player.
     * @example
     *```typescript
     * // Resolve a player by their client id.
     * const player = room.resolvePlayer(11013);
     * ```
     */
    resolvePlayer(player: PlayerResolvable): Player<this> | undefined {
        if (player instanceof Player)
            return player as Player<this>;

        const clientId = this.resolvePlayerClientID(player);

        if (clientId === undefined)
            return undefined;

        return this.players.get(clientId);
    }

    /**
     * Resolve a client id by some identifier.
     * @param player The identifier to resolve to a client ID.
     * @returns The resolved client ID.
     */
    resolvePlayerClientID(player: PlayerResolvable) {
        if (typeof player === "undefined") {
            return undefined;
        }

        if (typeof player === "number") {
            return player;
        }

        if (player instanceof NetworkedObject) {
            return player.ownerId;
        }

        if (player instanceof Player) {
            return player.clientId;
        }

        return undefined;
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

        if (this.isAuthoritative && this.playerAuthority && this.playerAuthority.characterControl) {
            this.playerAuthority.characterControl.syncSettings(this.settings);
        }
    }

    async spawnNecessaryObjects() {
        if (!this.lobbyBehaviour && this.gameState === GameState.NotStarted) {
            await this.spawnObjectOfType(SpawnType.LobbyBehaviour, SpecialOwnerId.Global, SpawnFlag.None);
        }

        if (!this.shipStatus && this.gameState === GameState.Started) {
            const shipPrefabs = [
                SpawnType.SkeldShipStatus,
                SpawnType.MiraShipStatus,
                SpawnType.PolusShipStatus,
                SpawnType.AprilShipStatus,
                SpawnType.AirshipShipStatus,
            ];

            await this.spawnObjectOfType(shipPrefabs[this.settings?.map] || 0, SpecialOwnerId.Global, SpawnFlag.None);
        }

        if (!this.voteBanSystem) {
            await this.spawnObjectOfType(SpawnType.VoteBanSystem, SpecialOwnerId.Global, SpawnFlag.None);
        }

        if (!this.gameManager) {
            if (this.settings.gameMode === GameMode.Normal) {
                await this.spawnObjectOfType(SpawnType.NormalGameManager, SpecialOwnerId.Global, SpawnFlag.None);
            } else if (this.settings.gameMode === GameMode.HideNSeek) {
                await this.spawnObjectOfType(SpawnType.HideAndSeekManager, SpecialOwnerId.Global, SpawnFlag.None);
            }
        }
    }

    /**
     * Set the host of the room. If the current client is the new host, it will conduct required host changes.
     * e.g. Spawning objects if they are not already spawned.
     * @param playerResolvable The new host of the room.
     */
    async setPlayerAuthority(playerResolvable: PlayerResolvable) {
        const before = this.authorityId;
        const resolvedId = this.resolvePlayerClientID(playerResolvable);

        if (!resolvedId) return;

        this.authorityId = resolvedId;

        if (this.isAuthoritative) {
            this.spawnNecessaryObjects();
        }

        if (before !== this.authorityId && this.playerAuthority) {
            await this.playerAuthority.emit(new PlayerSetAuthoritativeEvent(this, this.playerAuthority));
        }
    }

    /**
     * Handle when a client joins the game.
     * @param clientId The ID of the client that joined the game.
     */
    async handleJoin(joinInfo: PlayerJoinData) {
        const cachedPlayer = this.players.get(joinInfo.clientId);
        if (cachedPlayer)
            return cachedPlayer;

        const player = new Player(this, joinInfo.clientId, joinInfo.playerName, joinInfo.platform, joinInfo.playerLevel, joinInfo.friendCode, joinInfo.puid);
        this.players.set(joinInfo.clientId, player);

        if (this.isAuthoritative) {
            this.spawnNecessaryObjects();
        }

        await player.emit(new PlayerJoinEvent(this, player));

        return player;
    }

    checkPlayersRemaining() {
        if (!this.shipStatus)
            return;

        let aliveCrewmates = 0;
        let aliveImpostors = 0;
        let totalImpostors = 0;

        for (const [, playerInfo] of this.playerInfo) {
            if (playerInfo.isDisconnected)
                continue;

            if (playerInfo.roleType?.roleMetadata.roleTeam === RoleTeamType.Impostor) {
                totalImpostors++;
                if (!playerInfo.isDead) {
                    aliveImpostors++;
                }
                continue;
            }

            if (playerInfo.isDead) {
                if (playerInfo.roleType?.roleMetadata.roleType === RoleType.ImpostorGhost && (playerInfo.getPlayer()?.role as ImpostorGhostRole<this> | undefined)?.wasManuallyPicked) {
                    aliveImpostors++;
                }
            } else {
                aliveCrewmates++;
            }
        }

        const reason = totalImpostors === 0
            ? GameOverReason.ImpostorDisconnect
            : aliveCrewmates <= aliveImpostors
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
                        aliveCrewmates
                    }
                )
            );
        }
    }

    /**
     * Handle when a client leaves the game.
     * @param resolvable The client that left the game.
     */
    async handleLeave(resolvable: PlayerResolvable) {
        const player = this.resolvePlayer(resolvable);

        if (!player)
            return null;

        const playerId = player.getPlayerId();

        if (playerId !== undefined) {
            if (this.gameState === GameState.Started) {
                const gamedataEntry = this.playerInfo.get(playerId);
                if (gamedataEntry) {
                    gamedataEntry.setDisconnected(true);
                }

                this.checkPlayersRemaining();
            } else {
                this.playerInfo.delete(playerId);
            }

            if (this.isAuthoritative && this.meetingHud) {
                for (const [, voteState] of this.meetingHud.voteStates) {
                    const voteStatePlayer = voteState.player;
                    if (voteStatePlayer && voteState.votedForId === playerId) {
                        this.meetingHud.clearVoteBroadcast(voteStatePlayer);
                    }
                }
            }
        }

        if (this.voteBanSystem && this.voteBanSystem.voted.get(player.clientId)) {
            this.voteBanSystem.voted.delete(player.clientId);
        }

        if (player.characterControl) {
            for (const component of player.characterControl.components) {
                this.despawnComponent(component);
            }
        }

        this.players.delete(player.clientId);

        this.emitSync(new PlayerLeaveEvent(this, player));

        return player;
    }

    waitingForReady(player: Player<this>): boolean {
        return !player.isReady;
    }

    /**
     * Start the game. If the client's player is not the host, the server may ban the client.
     */
    async handleStartGame() {
        this.gameState = GameState.Started;

        for (const [, playerInfo] of this.playerInfo) {
            playerInfo.dirtyBit = 1;
        }
        if (this.lobbyBehaviour) this.despawnComponent(this.lobbyBehaviour);

        const shipPrefabId = this.shipPrefabIds.get(this.settings.map);
        const shipPrefab = await this.spawnObjectOfType(shipPrefabId || SpawnType.SkeldShipStatus, SpecialOwnerId.Global, SpawnFlag.None) as InnerShipStatus<this>;

        const waitSeconds = shipPrefab.getStartWaitSeconds();

        await Promise.all([
            Promise.race([
                Promise.all(
                    [...this.players.values()].map((player) => {
                        if (!this.waitingForReady(player)) {
                            return Promise.resolve();
                        }

                        return new Promise<void>((resolve) => {
                            player.once("player.ready", () => resolve());
                            player.once("player.leave", () => resolve());
                        });
                    })
                ),
                setTimeoutPromise(waitSeconds * 1000),
            ])
        ]);

        const removes = [];
        for (const [, player] of this.players) {
            if (this.waitingForReady(player)) {
                await this.handleLeave(player);
                removes.push(player);
            }
            player.isReady = false;
        }

        if (removes.length) {
            await this.removeUnreadiedPlayers(removes);
        }

        await this.gameManager?.onGameStart();
        await this.shipStatus?.assignTasks();

        if (this.shipStatus) {
            for (const [, player] of this.players) {
                await this.shipStatus.spawnPlayer(player, true, false);
            }
        }

        await this.emit(new RoomGameStartedEvent(this));
    }

    /**
     * Handle when the game is ended.
     * @param reason The reason for why the game ended.
     */
    async handleEndGame(reason: GameOverReason) {
        this.gameState = GameState.Ended;
        this.players.clear();
        for (const [objId] of this.players) {
            this.players.delete(objId);
        }
        if (this.isAuthoritative) {
            for (const [, component] of this.networkedObjects) {
                this.despawnComponent(component);
            }
        }
        await this.emit(new RoomGameEndedEvent(this, reason));
    }

    /**
     * Handle a client readying up.
     * @param player The client that readied.
     */
    async handleReady(player: PlayerResolvable) {
        const resolved = this.resolvePlayer(player);

        if (resolved) {
            await resolved.readyUp();
        }
    }

    /**
     * Spawn a component (Not broadcasted to all clients, see {@link StatefulRoom.spawnObjectOfType}).
     * @param component The component being spawned.
     * @example
     * ```typescript
     * const meetinghud = new MeetingHud(
     *   this,
     *   this.getNextNetId(),
     *   ownerId,
     *   {
     *     dirtyBit: 0,
     *     states: new Map(),
     *   }
     * );
     *
     * this.spawnComponent(meetinghud);
     * ```
     */
    spawnComponent(component: NetworkedObject<this>) {
        if (this.networkedObjects.get(component.netId)) {
            return;
        }

        if (component instanceof LobbyBehaviour && !this.lobbyBehaviour) {
            if (!this.lobbyBehaviour) {
                this.lobbyBehaviour = component as LobbyBehaviour<this>; // (??)
            }
        }

        if (component instanceof InnerShipStatus && !this.shipStatus) {
            if (!this.shipStatus) {
                this.shipStatus = component;
            }
        }

        if (component instanceof VoteBanSystem && !this.voteBanSystem) {
            this.voteBanSystem = component;
        }

        if (component instanceof MeetingHud && !this.meetingHud) {
            this.meetingHud = component;
        }

        if (component instanceof InnerGameManager && !this.gameManager) {
            this.gameManager = component;
        }

        this.networkedObjects.set(component.netId, component);

        component.emitSync(new ComponentSpawnEvent(this, component));
    }

    protected _despawnComponent(component: NetworkedObject<this>) {
        this.networkedObjects.delete(component.netId);

        if (component.owner instanceof Player) {
            if (component.owner.characterControl === component) {
                component.owner.characterControl = undefined;
            }
        }

        if (component === this.lobbyBehaviour) {
            this.lobbyBehaviour = undefined;
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

        if (component === this.gameManager) {
            this.gameManager = undefined;
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

        component.emitSync(
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
    despawnComponent(component: NetworkedObject<this>) {
        this._despawnComponent(component);
        this.broadcastLazy(new DespawnMessage(component.netId));
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
        for (let i = 0; ; i++) {
            if (!this.playerInfo.has(i)) {
                return i;
            }
        }
    }

    createObjectSpawnMessage(object: NetworkedObject<this>): SpawnMessage {
        return new SpawnMessage(
            object.spawnType,
            object.ownerId,
            object.flags,
            object.components.map(component => {
                const writer = HazelWriter.alloc(512);
                writer.write(component, true);
                writer.realloc(writer.cursor);

                return new ComponentSpawnData(component.netId, writer.buffer);
            })
        );
    }

    getExistingObjectSpawn() {
        return this.objectList.map(object => this.createObjectSpawnMessage(object));
    }

    protected async createObjectWithNetIds(
        spawnType: number,
        componentPrefab: NetworkedObjectConstructor<any>[],
        ownerId: number,
        flags: number,
        netIds: number[],
    ) {
        if (componentPrefab.length === 0) throw new Error("Invalid spawn prefab, 0 components");
        if (netIds.length !== componentPrefab.length) throw new Error("Expected " + componentPrefab.length + " net ids, got " + netIds.length);

        let object!: NetworkedObject<this>;

        for (let i = 0; i < componentPrefab.length; i++) {
            const netId = netIds[i];

            if (this.networkedObjects.get(netId))
                throw new Error("Duplicate NetID: " + netId);

            const component = new componentPrefab[i](
                this,
                spawnType,
                netId,
                ownerId,
                flags,
            );

            if (!object) {
                object = component;
                this.objectList.push(object);
            }

            // A whole prefab's components are all shared
            component.components = object.components;
            object.components.push(component);

            this.spawnComponent(component);
        }
        
        const ownerPlayer = this.players.get(ownerId);

        if ((flags & SpawnFlag.IsClientCharacter) > 0 && ownerPlayer) {
            if (!ownerPlayer.characterControl) {
                ownerPlayer.characterControl = object as PlayerControl<this>;
                ownerPlayer.inScene = true;
            }
        }

        if (spawnType === SpawnType.Player && ownerPlayer) {
            await ownerPlayer.emit(new PlayerSpawnEvent(this, ownerPlayer));
        }

        return object;
    }

    protected async createObject(
        spawnType: number,
        spawnPrefab: NetworkedObjectConstructor<any>[],
        ownerId: number,
        flags: number,
    ) {
        const netIds = [];
        for (let i = 0; i < spawnPrefab.length; i++) {
            const netId = this.getNextNetId();
            netIds.push(netId);
        }
        return await this.createObjectWithNetIds(spawnType, spawnPrefab, ownerId, flags, netIds);
    }

    /**
     * Spawn a prefab of an object.
     * @param spawnType The type of object to spawn.
     * @param owner The owner or ID of the owner of the object to spawn.
     * @returns The object that was spawned.
     * @example
     *```typescript
     * room.spawnPrefab(SpawnType.Player, client.myPlayer);
     * ```
     */
    async createObjectOfType(
        spawnType: number,
        ownerId: number,
        flags: number,
    ): Promise<NetworkedObject<this>> {
        const spawnPrefab = this.registeredPrefabs.get(spawnType);

        if (!spawnPrefab)
            throw new Error("Cannot spawn object of type: " + spawnType + " (not registered)");

        return this.createObject(spawnType, spawnPrefab, ownerId, flags);
    }

    async spawnObjectOfType(spawnType: number, ownerId: number, flags: number): Promise<NetworkedObject<this>> {
        const object = await this.createObjectOfType(spawnType, ownerId, flags);
        for (const component of object.components) await component.processAwake();
        this.broadcastLazy(this.createObjectSpawnMessage(object));
        return object;
    }

    /**
     * Register a custom INO spawn object by its spawn type. Can also override
     * built-in objects.
     * @param spawnType The spawn type of the component as an integer.
     * @param components The components in the object. The first component should
     * be the main object which will inherit the rest of the components.
     */
    registerPrefab(spawnType: number, components: NetworkedObjectConstructor<NetworkedObject<this>>[]) {
        if (components.length < 1) {
            throw new Error("Expected at least 1 component to create a networked object prefab from.");
        }

        this.registeredPrefabs.set(spawnType, components);
    }

    /**
     * Register a role that can be assigned to a player.
     * @param roleCtr The role to register to the room.
     */
    registerRole(roleCtr: typeof BaseRole) {
        this.registeredRoles.set(roleCtr.roleMetadata.roleType, roleCtr);
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
    getPlayerByPlayerId(playerId: number): Player<this> | undefined {
        return this.getPlayerControlByPlayerId(playerId)?.player;
    }

    getPlayerControlByPlayerId(playerId: number): PlayerControl<this> | undefined {
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
     * Get a player by one of their components' netIds.
     * @param netId The net ID of the component of the player to search.
     * @returns The player that was found, or null if they do not exist.
     * @example
     * ```typescript
     * const player = room.getPlayerByNetId(34);
     * ```
     */
    getPlayerByNetId(netId: number) {
        for (const [, player] of this.players) {
            if (!player.characterControl)
                continue;

            if (player.characterControl.components.find(component => component.netId === netId)) {
                return player;
            }
        }

        return undefined;
    }

    findPlayersWithName(displayName: string) {
        const players = [];
        for (const [, player] of this.players) {
            if (player.getPlayerInfo()?.defaultOutfit.name === displayName) {
                players.push(player);
            }
        }
        return players;
    }

    /**
     * Register an intent to end the game.
     * @param endGameIntent The intention to end the game.
     */
    registerEndGameIntent(endGameIntent: EndGameIntent<any>) {
        this.endGameIntents.push(endGameIntent);
    }
    
    abstract endGame(reason: GameOverReason): Promise<void>;

    abstract clearMyVote(meetingHud: MeetingHud<this>): Promise<void>;
    abstract getSelectedSeekerAllowed(seekerPlayerId: number): boolean;
    abstract sendRepairSystem(systemType: SystemType, amount: number): Promise<void>;

    abstract playerVoteKicked(player: Player<this>): Promise<void>;
    abstract removeUnreadiedPlayers(players: Player<this>[]): Promise<void>;

    /**
     * How often a processFixedUpdate should be called.
     */
    static processFixedUpdateInterval = 1 / 50;
}
