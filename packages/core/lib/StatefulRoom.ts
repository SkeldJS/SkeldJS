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
    AllGameSettings,
    EndGameMessage,
    PlayerJoinData
} from "@skeldjs/protocol";

import {
    GameCode,
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
    GameState,
    RoleType,
    RoleTeamType,
    GameMode,
    GameMap,
    SystemType
} from "@skeldjs/constant";

import { EventEmitter, ExtractEventTypes } from "@skeldjs/events";

import {
    AirshipStatus,
    AprilShipStatus,
    CustomNetworkTransform,
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

import { NetworkedObject, NetworkedObjectEvents, NetworkedObjectConstructor } from "./NetworkedObject";
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
    RoomGameEndEvent,
    RoomGameStartEvent,
    RoomSetPrivacyEvent
} from "./events";

import { AmongUsEndGames, EndGameIntent, PlayersDisconnectEndgameMetadata } from "./endgame";
import { BaseRole, CrewmateGhostRole, CrewmateRole, DetectiveRole, EngineerRole, GuardianAngelRole, ImpostorRole, NoisemakerRole, PhantomRole, ScientistRole, ShapeshifterRole, TrackerRole, ViperRole } from "./roles";
import { StatefulRoomConfig } from "./misc";
import { ImpostorGhostRole } from "./roles/ImpostorGhost";
import { SystemStatus } from "./systems";

export type RoomID = string | number;

export enum SpecialOwnerId {
    Global = -2,
    /**
     * Only used internally, not by SkeldJS
     */
    CurrentClient = -3,
    Server = -4,
}

export type PlayerResolvable =
    | number
    | Player
    | PlayerControl
    | PlayerPhysics
    | CustomNetworkTransform;

export type PrivacyType = "public" | "private";

export interface SpawnObject {
    type: number;
    ownerId: number;
    flags: number;
    components: NetworkedObject<any, any>[];
}

export type AnyNetworkedObject<RoomType extends StatefulRoom = StatefulRoom> =
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

export type StatefulRoomEvents<RoomType extends StatefulRoom = StatefulRoom> = NetworkedObjectEvents<RoomType> &
    PlayerEvents<RoomType> &
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
            RoomSetPrivacyEvent<RoomType>
        ]
    >;

export type GetStatefulRoomEvents<T extends StatefulRoom<StatefulRoomEvents>> = T extends StatefulRoom<infer X> ? X : never;

/**
 * Represents an object capable of hosting games.
 *
 * See {@link StatefulRoomEvents} for events to listen to.
 */
export class StatefulRoom<
    T extends StatefulRoomEvents = any
> extends EventEmitter<T> {

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
    objectList: NetworkedObject[];

    /**
     * The players in the room.
     */
    players: Map<number, Player<this>>;

    /**
     * The networked components in the room.
     */
    networkedObjects: Map<number, NetworkedObject<any, NetworkedObjectEvents, this>>;

    /**
     * The current message stream to be sent to the server on fixed update.
     */
    messageStream: BaseGameDataMessage[];

    /**
     * The code of the room.
     */
    code: number;

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
    counter: number;

    /**
     * The privacy state of the room.
     */
    privacy: PrivacyType;

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

    playerInfo: Map<number, NetworkedPlayerInfo>;

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
     * See {@link RoomGameEndEvent} to listen for a game actually ending.
     */
    endGameIntents: EndGameIntent<any>[];

    constructor(public config: StatefulRoomConfig = {}) {
        super();

        this.lastFixedUpdateTimestamp = Date.now();
        this.lastNetId = 0;
        this.destroyed = false;

        this.code = 0;
        this.gameState = GameState.NotStarted;
        this.authorityId = -1;
        this.counter = -1;
        this.privacy = "private";

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
            [SpawnType.FungleShipStatus, []], // TODO
        ]);

        this.shipPrefabIds = new Map([
            [GameMap.TheSkeld, SpawnType.SkeldShipStatus],
            [GameMap.MiraHQ, SpawnType.MiraShipStatus],
            [GameMap.Polus, SpawnType.PolusShipStatus],
            [GameMap.AprilFoolsTheSkeld, SpawnType.AprilShipStatus],
            [GameMap.Airship, SpawnType.AirshipShipStatus],
            [GameMap.Fungal, SpawnType.FungleShipStatus],
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
                () => this.FixedUpdate(),
                StatefulRoom.FixedUpdateInterval
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
    canManageObject(object: NetworkedObject) {
        return this.isAuthoritative;
    }

    async broadcast(
        gamedata: BaseGameDataMessage[],
        payloads: BaseRootMessage[] = [],
        include?: (Player | number)[],
        exclude?: (Player | number)[],
        reliable = true
    ) { }

    async FixedUpdate() {
        const delta = Date.now() - this.lastFixedUpdateTimestamp;
        this.lastFixedUpdateTimestamp = Date.now();
        for (const [, component] of this.networkedObjects) {
            if (this.canManageObject(component)) {
                component.FixedUpdate(delta / 1000);
                if (component.dirtyBit) {
                    component.PreSerialize();
                    const writer = HazelWriter.alloc(0);
                    if (component.Serialize(writer, false)) {
                        this.messageStream.push(
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
                await this.broadcast(stream);
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
     * Set the code of the room.
     * @example
     *```typescript
     * room.setCode("ABCDEF");
     * ```
     */
    setCode(code: RoomID): void {
        if (typeof code === "string") {
            return this.setCode(GameCode.convertStringToInt(code));
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
            await this.broadcast([], [
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

        if (this.isAuthoritative && this.playerAuthority && this.playerAuthority.characterControl) {
            this.playerAuthority.characterControl.syncSettings(this.settings);
        }
    }

    async spawnNecessaryObjects() {
        if (!this.lobbyBehaviour && this.gameState === GameState.NotStarted) {
            await this.spawnPrefabOfType(SpawnType.LobbyBehaviour, SpecialOwnerId.Global);
        }

        if (!this.shipStatus && this.gameState === GameState.Started) {
            const shipPrefabs = [
                SpawnType.SkeldShipStatus,
                SpawnType.MiraShipStatus,
                SpawnType.PolusShipStatus,
                SpawnType.AprilShipStatus,
                SpawnType.AirshipShipStatus,
            ];

            await this.spawnPrefabOfType(shipPrefabs[this.settings?.map] || 0, SpecialOwnerId.Global);
        }

        if (!this.voteBanSystem) {
            await this.spawnPrefabOfType(SpawnType.VoteBanSystem, SpecialOwnerId.Global);
        }

        if (!this.gameManager) {
            if (this.settings.gameMode === GameMode.Normal) {
                await this.spawnPrefabOfType(SpawnType.NormalGameManager, SpecialOwnerId.Global);
            } else if (this.settings.gameMode === GameMode.HideNSeek) {
                await this.spawnPrefabOfType(SpawnType.HideAndSeekManager, SpecialOwnerId.Global);
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
                if (playerInfo.roleType?.roleMetadata.roleType === RoleType.ImpostorGhost && (playerInfo.getPlayer()?.role as ImpostorGhostRole | undefined)?.wasManuallyPicked) {
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

    waitingForReady(player: Player): boolean {
        return player.isReady;
    }

    /**
     * Start the game. If the client's player is not the host, the server may ban the client.
     */
    async startGame() {
        if (this.gameState === GameState.Started)
            return;

        this.gameState = GameState.Started;

        for (const [, playerInfo] of this.playerInfo) {
            playerInfo.dirtyBit = 1;
        }
        if (this.lobbyBehaviour) this.despawnComponent(this.lobbyBehaviour);

        const shipPrefabId = this.shipPrefabIds.get(this.settings.map);
        await this.spawnPrefabOfType(shipPrefabId || SpawnType.SkeldShipStatus, SpecialOwnerId.Global);

        await Promise.all([
            Promise.race([
                Promise.all(
                    [...this.players.values()].map((player) => {
                        if (this.waitingForReady(player)) {
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
            ])
        ]);

        const removes = [];
        for (const [clientId, player] of this.players) {
            if (this.waitingForReady(player)) {
                await this.handleLeave(player);
                removes.push(clientId);
            }
        }

        if (removes.length) {
            await this.broadcast(
                [],
                removes.map(clientId => {
                    return new RemovePlayerMessage(
                        this.code,
                        clientId,
                        DisconnectReason.Error
                    );
                })
            );
        }

        await this.gameManager?.onGameStart();
        await this.shipStatus?.assignTasks();

        if (this.shipStatus) {
            for (const [, player] of this.players) {
                await this.shipStatus.spawnPlayer(player, true, false);
            }
        }
    }

    protected async _handleEnd(reason: GameOverReason) {
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
        if (this.gameState !== GameState.Started)
            return;

        this.gameState = GameState.Ended;
        await this.broadcast([], [
            new EndGameMessage(this.code, reason, false)
        ]);
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
     * Spawn a component (Not broadcasted to all clients, see {@link StatefulRoom.spawnPrefabOfType}).
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
    spawnComponent(component: NetworkedObject<any, NetworkedObjectEvents, this>) {
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

        if (component instanceof NetworkedPlayerInfo) {
            this.playerInfo.set(component.playerId, component);
        }

        this.networkedObjects.set(component.netId, component);

        component.emitSync(
            new ComponentSpawnEvent(this, component)
        );
    }

    protected _despawnComponent(component: NetworkedObject<any>) {
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
    despawnComponent(component: NetworkedObject<any, NetworkedObjectEvents, this>) {
        this._despawnComponent(component);

        this.messageStream.push(new DespawnMessage(component.netId));
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

    protected createObjectSpawnMessage(object: NetworkedObject): SpawnMessage {
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

    protected async spawnPrefab(
        spawnType: number,
        spawnPrefab: NetworkedObjectConstructor<any>[],
        ownerId: number | Player | undefined,
        flags?: number,
        componentData: (any | ComponentSpawnData)[] = [],
        doBroadcast: boolean | undefined = true,
        doAwake = true
    ) {
        const _ownerId =
            ownerId === undefined
                ? SpecialOwnerId.Global
                : typeof ownerId === "number" ? ownerId : ownerId.clientId;

        const _flags = flags ?? (spawnType === SpawnType.Player ? SpawnFlag.IsClientCharacter : 0);

        let object!: NetworkedObject;

        for (let i = 0; i < spawnPrefab.length; i++) {
            const component = new spawnPrefab[i](
                this,
                spawnType,
                componentData?.[i]?.netId || this.getNextNetId(),
                _ownerId,
                _flags,
                componentData?.[i] instanceof ComponentSpawnData
                    ? HazelReader.from(componentData[i].data)
                    : componentData?.[i],
                object
            );

            if (this.networkedObjects.get(component.netId))
                continue;

            if (!object) {
                object = component;
                this.objectList.push(object);
            }

            this.spawnComponent(component as NetworkedObject<any, NetworkedObjectEvents, this>);
            object.components.push(component);
        }

        if (!object)
            return;

        if (doAwake) {
            for (const component of object.components) {
                component.Awake();
            }
        }

        if ((this.isAuthoritative && doBroadcast === undefined) || doBroadcast) {
            this.messageStream.push(
                new SpawnMessage(
                    spawnType,
                    object.ownerId,
                    _flags,
                    object.components.map((component) => {
                        const writer = HazelWriter.alloc(512);
                        writer.write(component, true);
                        writer.realloc(writer.cursor);

                        return new ComponentSpawnData(
                            component.netId,
                            writer.buffer
                        );
                    })
                )
            );
        }
        
        const ownerPlayer = this.players.get(_ownerId);

        if ((_flags & SpawnFlag.IsClientCharacter) > 0 && ownerPlayer) {
            if (!ownerPlayer.characterControl) {
                ownerPlayer.characterControl = object as PlayerControl<this>;
                ownerPlayer.inScene = true;
            }
        }

        if (spawnType === SpawnType.Player && ownerPlayer) {
            await ownerPlayer.emit(new PlayerSpawnEvent(this, ownerPlayer));
        }

        return object as NetworkedObject<any, any, this>;
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
    async spawnPrefabOfType(
        spawnType: number,
        ownerId: number | Player | undefined,
        flags?: number,
        componentData?: (any | ComponentSpawnData)[],
        doBroadcast = true,
        doAwake = true
    ): Promise<NetworkedObject<any, any, this> | undefined> {
        const spawnPrefab = this.registeredPrefabs.get(spawnType);

        if (!spawnPrefab)
            throw new Error("Cannot spawn object of type: " + spawnType + " (not registered)");

        return this.spawnPrefab(spawnType, spawnPrefab, ownerId, flags, componentData, doBroadcast, doAwake);
    }

    /**
     * Register a custom INO spawn object by its spawn type. Can also override
     * built-in objects.
     * @param spawnType The spawn type of the component as an integer.
     * @param components The components in the object. The first component should
     * be the main object which will inherit the rest of the components.
     */
    registerPrefab(spawnType: number, components: NetworkedObjectConstructor<NetworkedObject>[]) {
        if (components.length < 1) {
            throw new Error("Expected at least 1 component to create an INO prefab from.");
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

    murderIsValid(murderer: Player, victim: Player) {
        if (this.gameState !== GameState.Started)
            return false;

        const murdererPlayerInfo = murderer.getPlayerInfo();
        const victimPlayerInfo = victim.getPlayerInfo();

        if (murdererPlayerInfo?.isDead || !murdererPlayerInfo?.roleType || murdererPlayerInfo?.roleType.roleMetadata.roleTeam !== RoleTeamType.Impostor || murdererPlayerInfo?.isDisconnected) {
            return false;
        }

        const victimPhysics = victim.characterControl?.getComponentSafe(1, PlayerPhysics);

        if (!victimPlayerInfo || victimPlayerInfo.isDead || victimPhysics?.isInVent) {
            return false;
        }

        return true;
    }

    clearMyVote(meetingHud: MeetingHud): Promise<void> {
        throw new Error("'clearMyVote' not implemented on StatefulRoom")
    }

    sendRepairSystem(systemType: SystemType, amount: number): Promise<void> {
        throw new Error("'repairSystem' not implemented on StatefulRoom");
    }

    /**
     * How often a FixedUpdate should be called.
     */
    static FixedUpdateInterval = 1 / 50;
}
