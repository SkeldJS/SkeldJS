import { HazelReader, HazelWriter } from "@skeldjs/util";

import {
    BaseRpcMessage,
    CheckColorMessage,
    CheckMurderMessage,
    CheckNameMessage,
    CompleteTaskMessage,
    GameSettings,
    MurderPlayerMessage,
    QuickChatMessageData,
    QuickChatPhraseMessageData,
    QuickChatPlayerMessageData,
    QuickChatSentenceMessageData,
    ReportDeadBodyMessage,
    RpcMessage,
    SendChatMessage,
    SendChatNoteMessage,
    SendQuickChatMessage,
    SetColorMessage,
    SetHatMessage,
    SetInfectedMessage,
    SetNameMessage,
    SetNameplateMessage,
    SetPetMessage,
    SetSkinMessage,
    SetStartCounterMessage,
    SetVisorMessage,
    StartMeetingMessage,
    SyncSettingsMessage,
    UsePlatformMessage
} from "@skeldjs/protocol";

import {
    SpawnType,
    RpcMessageTag,
    Color,
    Hat,
    Skin,
    ChatNoteType,
    Pet,
    SystemType,
    StringNames,
    GameOverReason,
    PlayerOutfitType,
    Visor,
    Nameplate
} from "@skeldjs/constant";

import {
    PlayerCheckColorEvent,
    PlayerCheckNameEvent,
    PlayerCompleteTaskEvent,
    PlayerUseMovingPlatformEvent,
    PlayerMurderEvent,
    PlayerReportDeadBodyEvent,
    PlayerSendChatEvent,
    PlayerSendQuickChatEvent,
    PlayerSetColorEvent,
    PlayerSetHatEvent,
    PlayerSetImpostorsEvent,
    PlayerSetNameEvent,
    PlayerSetPetEvent,
    PlayerSetSkinEvent,
    PlayerSetStartCounterEvent,
    PlayerStartMeetingEvent,
    PlayerSyncSettingsEvent,
    PlayerDieEvent,
    PlayerSetVisorEvent,
    PlayerSetNameplateEvent,
    PlayerCheckMurderEvent
} from "../events";

import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents, NetworkableConstructor } from "../Networkable";
import { Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";

import { AirshipStatus } from "./AirshipStatus";
import { LobbyBehaviour } from "./LobbyBehaviour";
import { MeetingHud } from "./MeetingHud";

import { MovingPlatformSide, MovingPlatformSystem } from "../systems";
import { CustomNetworkTransform, PlayerPhysics } from "./component";
import { AmongUsEndGames, EndGameIntent, PlayersKillEndgameMetadata } from "../endgame";

export interface PlayerControlData {
    isNew: boolean;
    playerId: number;
}

export type PlayerControlEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> &
    ExtractEventTypes<
        [
            PlayerCheckColorEvent<RoomType>,
            PlayerCheckMurderEvent<RoomType>,
            PlayerCheckNameEvent<RoomType>,
            PlayerCompleteTaskEvent<RoomType>,
            PlayerDieEvent<RoomType>,
            PlayerUseMovingPlatformEvent<RoomType>,
            PlayerMurderEvent<RoomType>,
            PlayerReportDeadBodyEvent<RoomType>,
            PlayerSendChatEvent<RoomType>,
            PlayerSendQuickChatEvent<RoomType>,
            PlayerSetColorEvent<RoomType>,
            PlayerSetHatEvent<RoomType>,
            PlayerSetImpostorsEvent<RoomType>,
            PlayerSetNameEvent<RoomType>,
            PlayerSetNameplateEvent<RoomType>,
            PlayerSetPetEvent<RoomType>,
            PlayerSetSkinEvent<RoomType>,
            PlayerSetStartCounterEvent<RoomType>,
            PlayerSetVisorEvent<RoomType>,
            PlayerStartMeetingEvent<RoomType>,
            PlayerSyncSettingsEvent<RoomType>
        ]
    >;

/**
 * Represents a player object for interacting with the game and other players.
 *
 * See {@link PlayerControlEvents} for events to listen to.
 */
export class PlayerControl<RoomType extends Hostable = Hostable> extends Networkable<
    PlayerControlData,
    PlayerControlEvents<RoomType>,
    RoomType
> implements PlayerControlData {
    private lastStartCounter = 0;

    /**
     * Whether the player was just spawned, or was spawned before joining.
     */
    isNew: boolean;

    /**
     * The player ID of the player.
     */
    playerId: number;

    /**
     * The player that this component belongs to.
     */
    player: PlayerData<RoomType>;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | PlayerControlData
    ) {
        super(room, spawnType, netId, ownerid, flags, data);

        this.isNew ??= true;
        this.playerId ||= 0;

        this.player = this.owner as PlayerData<RoomType>;
    }

    Awake() {
        this.playerId ||= this.room.getAvailablePlayerID();

        if (this.room.gameData) {
            this.room.gameData.add(this.playerId);
        }

        if (this.isNew) {
            if (this.room.lobbyBehaviour) {
                const spawnPosition = LobbyBehaviour.spawnPositions[this.playerId % LobbyBehaviour.spawnPositions.length];
                const offsetted = spawnPosition
                    .add(spawnPosition.negate().normalize().div(4));

                this.getComponent(CustomNetworkTransform)!.snapTo(offsetted);
            } else if (this.room.shipStatus) {
                const spawnPosition = this.room.shipStatus.getSpawnPosition(this.playerId, true);
                this.getComponent(CustomNetworkTransform)!.snapTo(spawnPosition);
            }
        }
    }

    getComponent<T extends Networkable>(
        component: NetworkableConstructor<T>
    ): T|undefined {
        if (this.spawnType === SpawnType.Player) {
            if (component === PlayerControl as NetworkableConstructor<any>) {
                return this.components[0] as unknown as T;
            }

            if (component === PlayerPhysics as NetworkableConstructor<any>) {
                return this.components[1] as unknown as T;
            }

            if (component === CustomNetworkTransform as NetworkableConstructor<any>) {
                return this.components[2] as unknown as T;
            }
        }

        return undefined;
    }

    Deserialize(reader: HazelReader, spawn: boolean = false) {
        if (spawn) {
            this.isNew = reader.bool();
        }

        this.playerId = reader.uint8();
    }

    Serialize(writer: HazelWriter, spawn: boolean = false) {
        if (spawn) {
            writer.bool(this.isNew);
            this.isNew = false;
        }

        writer.uint8(this.playerId);
        return true;
    }

    async HandleRpc(rpc: BaseRpcMessage) {
        switch (rpc.messageTag) {
            case RpcMessageTag.CompleteTask:
                await this._handleCompleteTask(rpc as CompleteTaskMessage);
                break;
            case RpcMessageTag.SyncSettings:
                await this._handleSyncSettings(rpc as SyncSettingsMessage);
                break;
            case RpcMessageTag.SetInfected:
                await this._handleSetImpostors(rpc as SetInfectedMessage);
                break;
            case RpcMessageTag.CheckName:
                if (this.room.hostIsMe) {
                    await this._handleCheckName(rpc as CheckNameMessage);
                }
                break;
            case RpcMessageTag.CheckColor:
                if (this.room.hostIsMe) {
                    await this._handleCheckColor(rpc as CheckColorMessage);
                }
                break;
            case RpcMessageTag.SetName:
                await this._handleSetName(rpc as SetNameMessage);
                break;
            case RpcMessageTag.SetColor:
                await this._handleSetColor(rpc as SetColorMessage);
                break;
            case RpcMessageTag.ReportDeadBody:
                if (this.room.hostIsMe) {
                    await this._handleReportDeadBody(
                        rpc as ReportDeadBodyMessage
                    );
                }
                break;
            case RpcMessageTag.MurderPlayer:
                await this._handleMurderPlayer(rpc as MurderPlayerMessage);
                break;
            case RpcMessageTag.SendChat:
                await this._handleSendChat(rpc as SendChatMessage);
                break;
            case RpcMessageTag.StartMeeting:
                await this._handleStartMeeting(rpc as StartMeetingMessage);
                break;
            case RpcMessageTag.SetStartCounter:
                await this._handleSetStartCounter(
                    rpc as SetStartCounterMessage
                );
                break;
            case RpcMessageTag.UsePlatform:
                await this._handleUsePlatform(rpc as UsePlatformMessage);
                break;
            case RpcMessageTag.SendQuickChat:
                await this._handleSendQuickChat(rpc as SendQuickChatMessage);
                break;
            case RpcMessageTag.SetHat:
                await this._handleSetHat(rpc as SetHatMessage);
                break;
            case RpcMessageTag.SetSkin:
                await this._handleSetSkin(rpc as SetSkinMessage);
                break;
            case RpcMessageTag.SetPet:
                await this._handleSetPet(rpc as SetPetMessage);
                break;
            case RpcMessageTag.SetVisor:
                await this._handleSetVisor(rpc as SetVisorMessage);
                break;
            case RpcMessageTag.SetNameplate:
                await this._handleSetNameplate(rpc as SetNameplateMessage);
                break;
            case RpcMessageTag.CheckMurder:
                await this._handleCheckMurder(rpc as CheckMurderMessage);
        }
    }

    private async _handleCompleteTask(rpc: CompleteTaskMessage) {
        if (!this.player.playerInfo?.taskStates)
            return;

        this._completeTask(rpc.taskidx);

        await this.emit(
            new PlayerCompleteTaskEvent(
                this.room,
                this.player,
                rpc,
                this.player.playerInfo.taskStates[rpc.taskidx]
            )
        );
    }

    private _completeTask(taskIdx: number) {
        this.room.gameData?.completeTask(this.playerId, taskIdx);
    }

    private async _rpcCompleteTask(taskIdx: number) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new CompleteTaskMessage(taskIdx)
            )
        );
    }

    /**
     * Mark one of this player's tasks as completed.
     * @param taskIdx The index of the task to complete. Note: this is not the
     * task ID but instead the index of the task in the {@link PlayerInfo.taskIds}
     * array.
     *
     * Emits a {@link PlayerCompleteTaskEvent | `player.completetask`} event.
     *
     * @example
     * ```ts
     * client.me.control.completeTask(0);
     * ```
     */
    completeTask(taskIdx: number) {
        if (!this.player.playerInfo?.taskStates[taskIdx])
            return;

        this.emit(
            new PlayerCompleteTaskEvent(
                this.room,
                this.player,
                undefined,
                this.player.playerInfo.taskStates[taskIdx]
            )
        );

        this._completeTask(taskIdx);
        this._rpcCompleteTask(taskIdx);
    }

    private async _handleSyncSettings(rpc: SyncSettingsMessage) {
        if (!rpc.settings)
            return;

        this._syncSettings(rpc.settings);

        const ev = await this.emit(
            new PlayerSyncSettingsEvent(
                this.room,
                this.player,
                rpc,
                rpc.settings
            )
        );

        if (ev.isDirty) {
            this._syncSettings(ev.alteredSettings);
            this._rpcSyncSettings(ev.alteredSettings);
        }
    }

    private _syncSettings(settings: GameSettings) {
        this.room.settings.patch(settings);
    }

    private async _rpcSyncSettings(settings: GameSettings) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SyncSettingsMessage(settings)
            )
        );
    }

    /**
     * Change the room's settings. Use {@link Hostable.setSettings} to pass a
     * partial game objects object. This is a host operation on official servers.
     *
     * Emits a {@link PlayerSyncSettingsEvent | `player.syncsettings`} event.
     *
     * @property settings The full game settings object to update the settings to.
     */
    async syncSettings(settings: GameSettings) {
        this._syncSettings(settings);

        const ev = await this.emit(
            new PlayerSyncSettingsEvent(
                this.room,
                this.player,
                undefined,
                settings
            )
        );

        this._syncSettings(ev.alteredSettings);

        this._rpcSyncSettings(settings);
    }

    private async _handleSetImpostors(rpc: SetInfectedMessage) {
        const impostors = rpc.impostors
            .map((id) => this.room.getPlayerByPlayerId(id))
            .filter((player) => player && player.playerInfo) as PlayerData[];

        this._setImpostors(impostors);

        const ev = await this.emit(
            new PlayerSetImpostorsEvent(
                this.room,
                this.player,
                rpc,
                impostors
            )
        );

        if (ev.isDirty) {
            this._setImpostors(ev.alteredImpostors);
            this._rpcSetImpostors(ev.alteredImpostors);
        }
    }

    private _setImpostors(impostors: PlayerData[]) {
        for (const [ , player ] of this.room.players) {
            if (!player.playerInfo)
                continue;

            if (impostors.includes(player)) {
                player.playerInfo.setImpostor(true);
            } else {
                if (player.playerInfo.isImpostor) {
                    player.playerInfo.setImpostor(false);
                }
            }
        }
    }

    private _rpcSetImpostors(impostors: PlayerData[]) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SetInfectedMessage(
                    impostors.map(impostor => impostor.playerId!)
                )
            )
        );
    }

    /**
     * Set the impostors of the room. Usually called straight after a game is
     * started via the {@link InnerShipStatus.selectImpostors} method. This is
     * a host operation on official servers.
     *
     * Will remove any existing impostors unless they are included in the array.
     *
     * Emits a {@link PlayerSetImpostorsEvent | `player.setimpostors`} event.
     *
     * @param impostors An array of impostors to set.
     * @example
     * ```ts
     * // Set everyone with "Judas" in their name as the impostor.
     * awiat client.me.control.setImpostors(
     *   [...this.room.players.values()]
     *     .filter(player => player.info.name.includes("Judas"))
     * );
     * ```
     */
    async setImpostors(impostors: PlayerData[]) {
        this._setImpostors(impostors);

        const ev = await this.emit(
            new PlayerSetImpostorsEvent(
                this.room,
                this.player,
                undefined,
                impostors
            )
        );

        if (ev.isDirty)
            this._setImpostors(ev.alteredImpostors);

        const clonedSettings = new GameSettings(this.room.settings);
        clonedSettings.numImpostors = impostors.length;
        this._rpcSyncSettings(clonedSettings);

        this._rpcSetImpostors(ev.alteredImpostors);
    }

    private async _handleCheckName(rpc: CheckNameMessage) {
        if (!this.room.gameData)
            return;

        let newName = rpc.name;

        const players = [...this.room.gameData.players.values()];
        if (
            players.some(
                (player) =>
                    player.playerId !== this.playerId &&
                    player.getOutfit(PlayerOutfitType.Default).name.toLowerCase() === newName.toLowerCase()
            )
        ) {
            for (let i = 1; i < 100; i++) {
                newName = rpc.name + " " + i;

                if (
                    !players.some(
                        (player) =>
                            player.playerId !== this.playerId &&
                            player.getOutfit(PlayerOutfitType.Default).name.toLowerCase() === newName.toLowerCase()
                    )
                ) {
                    break;
                }
            }
        }

        const ev = await this.emit(
            new PlayerCheckNameEvent(
                this.room,
                this.player,
                rpc,
                rpc.name,
                newName
            )
        );

        if (!ev.canceled)
            await this.setName(ev.alteredName);
    }

    private async _rpcCheckName(name: string) {
        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netId,
                    new CheckNameMessage(name)
                ),
            ],
            undefined,
            [ this.room.hostId ]
        );
    }

    /**
     * Request for the host to check a name for this player and append numbers if
     * it's taken.
     * @param name The name to request.
     */
    async checkName(name: string) {
        await this._rpcCheckName(name);
    }

    private async _handleSetName(rpc: SetNameMessage) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldName = defaultOutfit?.name;
        if (defaultOutfit)
            defaultOutfit.name = rpc.name;

        const ev = await this.emit(
            new PlayerSetNameEvent(
                this.room,
                this.player,
                rpc,
                oldName || "",
                rpc.name
            )
        );

        playerInfo?.setName(PlayerOutfitType.Default, ev.alteredName);

        if (ev.alteredName !== rpc.name)
            this._rpcSetName(ev.alteredName);
    }

    private _rpcSetName(name: string) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SetNameMessage(name)
            )
        );
    }

    /**
     * Update this player's name. This is a host operation on official servers.
     * Use {@link PlayerControl.checkName} if you are calling this as not the host.
     *
     * Emits a {@link PlayerSetNameEvent | `player.setname`} event.
     *
     * @param name The name to set this player's name to.
     */
    async setName(name: string) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldName = defaultOutfit?.name;
        if (defaultOutfit)
            defaultOutfit.name = name;

        const ev = await this.emit(
            new PlayerSetNameEvent(
                this.room,
                this.player,
                undefined,
                oldName || "",
                name
            )
        );

        playerInfo?.setName(PlayerOutfitType.Default, ev.alteredName);

        if (ev.alteredName !== oldName)
            this._rpcSetName(ev.alteredName);
    }

    private async _handleCheckColor(rpc: CheckColorMessage) {
        if (!this.room.gameData)
            return;

        let newColor = rpc.color;

        const players = [...this.room.gameData.players.values()];
        let i = 0;
        while (
            players.some(
                (player) =>
                    player.playerId !== this.playerId &&
                    player.getOutfit(PlayerOutfitType.Default).color === newColor
            )
        ) {
            newColor++;
            if (newColor >= 18)
                newColor = 0;

            i++;
            if (i >= 18)
                break;
        }

        const ev = await this.emit(
            new PlayerCheckColorEvent(
                this.room,
                this.player,
                rpc,
                rpc.color,
                newColor
            )
        );

        if (!ev.canceled)
            this.setColor(ev.alteredColor);
    }

    private async _rpcCheckColor(color: Color) {
        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netId,
                    new CheckColorMessage(color)
                ),
            ],
            undefined,
            [ this.room.hostId ]
        );
    }

    /**
     * Request for the host to check a color for this player and change it if it's
     * taken.
     *
     * @param color The color to request.
     */
    async checkColor(color: Color) {
        await this._rpcCheckColor(color);
    }

    private async _handleSetColor(rpc: SetColorMessage) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldColor = defaultOutfit?.color;
        if (defaultOutfit)
            defaultOutfit.color = rpc.color;

        const ev = await this.emit(
            new PlayerSetColorEvent(
                this.room,
                this.player,
                rpc,
                oldColor || Color.Red,
                rpc.color
            )
        );

        playerInfo?.setColor(PlayerOutfitType.Default, ev.alteredColor);

        if (ev.alteredColor !== rpc.color)
            this._rpcSetColor(ev.alteredColor);
    }

    private _rpcSetColor(color: Color) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SetColorMessage(color)
            )
        );
    }

    /**
     * Update this player's color. This is a host operation on official servers.
     * Use {@link PlayerControl.checkColor} if you are calling this as not the host.
     *
     * Emits a {@link PlayerCheckNameEvent | `player.checkname`} event.
     *
     * @param color The color to set this player's name to.
     */
    async setColor(color: Color) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldColor = defaultOutfit?.color;
        if (defaultOutfit)
            defaultOutfit.color = color;

        const ev = await this.emit(
            new PlayerSetColorEvent(
                this.room,
                this.player,
                undefined,
                oldColor || Color.Red,
                color
            )
        );

        playerInfo?.setColor(PlayerOutfitType.Default, ev.alteredColor);

        if (ev.alteredColor !== oldColor) {
            this._rpcSetColor(ev.alteredColor);
        }
    }

    private async _handleReportDeadBody(rpc: ReportDeadBodyMessage) {
        const reportedBody = rpc.bodyid === 0xff
            ? "emergency"
            : this.room.getPlayerByPlayerId(rpc.bodyid);

        if (!reportedBody)
            return;

        const ev = await this.emit(
            new PlayerReportDeadBodyEvent(
                this.room,
                this.player,
                rpc,
                reportedBody
            )
        );

        if (!ev.canceled) {
            this.room.host?.control?.startMeeting(ev.alteredBody, this.player);
        }
    }

    private async _rpcReportDeadBody(body: PlayerData | "emergency"): Promise<void> {
        if (body !== "emergency" && body.playerId === undefined) {
            return this._rpcReportDeadBody("emergency");
        }

        await this.room.broadcast([
            new RpcMessage(
                this.netId,
                new ReportDeadBodyMessage(
                    body === "emergency"
                        ? 0xff
                        : body.playerId!
                )
            )
        ], undefined, [ this.room.hostId ]);
    }

    async kill(reason: string) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);

        playerInfo?.setDead(true);

        const ev = await this.emit(
            new PlayerDieEvent(
                this.room,
                this.player,
                reason
            )
        );

        if (ev.reverted) {
            playerInfo?.setDead(false);
        }
    }

    private async _handleMurderPlayer(rpc: MurderPlayerMessage) {
        const victim = this.room.getPlayerByNetId(rpc.victimNetId);

        if (!victim)
            return;

        await victim.control?.kill("murder");

        await this.emit(
            new PlayerMurderEvent(
                this.room,
                this.player,
                rpc,
                victim
            )
        );

        this._checkMurderEndGame();
    }

    private _rpcMurderPlayer(victim: PlayerData) {
        if (!victim.control)
            return;

        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new MurderPlayerMessage(victim.control.netId)
            )
        );
    }

    /**
     * Murder another a player. This operation can only be called if the player
     * is the impostor on official servers.
     *
     * Due to technical limitations, this operation cannot be canceled or reverted
     * without advanced "breaking game", therefore it is out of scope of a single
     * `.revert()` function on the event emitted.
     *
     * Emits a {@link PlayerMurderEvent | `player.murder`} event.
     *
     * @param victim The player to murder.
     * @returns
     */
    async murderPlayer(victim: PlayerData) {
        if (!this.room.hostIsMe) {
            await this._rpcCheckMurder(victim);
            return;
        }

        await victim.control?.kill("murder");

        await this.emit(
            new PlayerMurderEvent(
                this.room,
                this.player,
                undefined,
                victim
            )
        );

        this._rpcMurderPlayer(victim);
        this._checkMurderEndGame();
    }

    private _checkMurderEndGame(victim?: PlayerData) {
        if (!this.room.gameData)
            return;

        let aliveCrewmates = 0;
        let aliveImpostors = 0;
        for (const [ , playerInfo ] of this.room.gameData.players) {
            if (!playerInfo.isDisconnected && !playerInfo.isDead)
            {
                if (playerInfo.isImpostor)
                {
                    aliveImpostors++;
                } else {
                    aliveCrewmates++;
                }
            }
        }

        if (aliveCrewmates <= aliveImpostors) {
            this.room.registerEndGameIntent(
                new EndGameIntent<PlayersKillEndgameMetadata>(
                    AmongUsEndGames.PlayersKill,
                    GameOverReason.ImpostorByKill,
                    {
                        killer: this.player,
                        victim,
                        aliveCrewmates,
                        aliveImpostors
                    }
                )
            );
        }
    }

    private async _handleSendChat(rpc: SendChatMessage) {
        await this.emit(
            new PlayerSendChatEvent(
                this.room,
                this.player,
                rpc,
                rpc.message
            )
        );
    }

    private _rpcSendChat(message: string) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SendChatMessage(message)
            )
        );
    }

    /**
     * Send a chat message as this player.
     *
     * Due to technical impossibilities, this event cannot be canceled or reverted.
     *
     * Emits a {@link PlayerSendChatEvent | `player.chat`} event.
     */
    sendChat(message: string) {
        this.emit(
            new PlayerSendChatEvent(
                this.room,
                this.player,
                undefined,
                message
            )
        );
        this._rpcSendChat(message);
    }

    private _rpcSendChatNote(player: PlayerData, type: ChatNoteType) {
        if (player.playerId === undefined)
            return;

        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SendChatNoteMessage(player.playerId, type)
            )
        );
    }

    /**
     * Send a player chat note for this player, i.e. "player x voted, x remaining.".
     */
    sendChatNote(player: PlayerData, type: ChatNoteType) {
        this._rpcSendChatNote(player, type);
    }

    private async _handleStartMeeting(rpc: StartMeetingMessage) {
        const reportedBody = rpc.bodyid === 0xff
            ? "emergency"
            : this.room.getPlayerByPlayerId(rpc.bodyid) || "emergency";

        await this.emit(
            new PlayerStartMeetingEvent(
                this.room,
                this.player,
                rpc,
                this.player,
                reportedBody
            )
        );

        if (this.room.hostIsMe) {
            this._startMeeting(this.player);
        }
    }

    private _startMeeting(caller: PlayerData) {
        if (caller.playerId === undefined)
            return;

        const spawnMeetinghud = this.room.spawnPrefab(
            SpawnType.MeetingHud,
            -2
        ) as MeetingHud<RoomType>;

        const callerState = spawnMeetinghud.voteStates.get(caller.playerId);
        if (callerState) {
            callerState.didReport = true;
        }

        const movingPlatform = this.room.shipStatus?.systems.get(SystemType.GapRoom);
        if (movingPlatform instanceof MovingPlatformSystem) {
            movingPlatform.setSide(MovingPlatformSide.Left);
        }
    }

    private _rpcStartMeeting(player: PlayerData|"emergency"): void {
        if (player !== "emergency" && player.playerId === undefined) {
            return this._rpcStartMeeting("emergency");
        }

        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new StartMeetingMessage(
                    player === "emergency"
                        ? 0xff
                        : player.playerId!
                )
            )
        );
    }

    /**
     * If you're the host, this will immediately begin a meeting
     * Start a meeting and begin the meeting
     *
     * Emits a {@link PlayerStartMeetingEvent | `player.startmeeting`} event.
     *
     * @param caller The player that called this meeting.
     * @param body The body that was reported, or "emergency" if it is an emergency meeting.
     */
    async startMeeting(body: PlayerData | "emergency", caller?: PlayerData) {
        if (!this.room.hostIsMe) {
            await this._rpcReportDeadBody(body);
            return;
        }

        const actualCaller = caller || this.room.host || this.player;
        this._rpcStartMeeting(body);
        this._startMeeting(actualCaller);

        await this.emit(
            new PlayerStartMeetingEvent(
                this.room,
                this.player,
                undefined,
                actualCaller,
                body
            )
        );
    }

    private async _handleSetStartCounter(rpc: SetStartCounterMessage) {
        const oldCounter = this.room.counter;
        this._setStartCounter(rpc.counter);

        const ev = await this.emit(
            new PlayerSetStartCounterEvent(
                this.room,
                this.player,
                rpc,
                oldCounter,
                rpc.counter
            )
        );

        this.room.counter = ev.alteredCounter;

        if (this.room.counter !== rpc.counter) {
            await this._rpcSetStartCounter(ev.alteredCounter);
        }
    }

    private _setStartCounter(counter: number) {
        this.lastStartCounter++;
        this.room.counter = counter;
    }

    private _rpcSetStartCounter(counter: number) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SetStartCounterMessage(
                    this.lastStartCounter,
                    counter
                )
            )
        );
    }

    /**
     * Change the counter at the bottom of the screen while in the lobby,
     * usually counting down from 5 to 1. This is a host-only operation
     * on official servers.
     *
     * Emits a {@link PlayerSetStartCounterEvent | `player.setstartcounter`} event.
     *
     * @param counter The counter to set to.
     */
    async setStartCounter(counter: number) {
        this._setStartCounter(counter);

        const ev = await this.emit(
            new PlayerSetStartCounterEvent(
                this.room,
                this.player,
                undefined,
                this.room.counter,
                counter
            )
        );

        if (ev.alteredCounter !== counter) {
            this.room.counter = ev.alteredCounter;
        }
        this._rpcSetStartCounter(ev.alteredCounter);
    }

    private async _handleUsePlatform(rpc: UsePlatformMessage) {
        const airship = this.room.shipStatus;

        if (!airship || !(airship instanceof AirshipStatus))
            return;

        const ev = await this.emit(
            new PlayerUseMovingPlatformEvent(
                this.room,
                this.player,
                rpc
            )
        );

        if (ev.canceled)
            return;

        this._usePlatform(false);
    }

    private _usePlatform(rpc: boolean) {
        const airship = this.room.shipStatus;

        if (!airship || !(airship instanceof AirshipStatus))
            return;

        const movingPlatform = airship.systems.get(SystemType.GapRoom);

        if (movingPlatform instanceof MovingPlatformSystem) {
            movingPlatform.setTarget(
                this.player,
                movingPlatform.oppositeSide,
                rpc
            );
        }
    }

    /**
     * Use the moving platfrom on the map, i.e. the one on Airship.
     *
     * Emits a {@link MovingPlatformPlayerUpdateEvent | `movingplatform.playerupdate`} event.
     */
    async usePlatform() {
        const ev = await this.emit(
            new PlayerUseMovingPlatformEvent(
                this.room,
                this.player,
                undefined
            )
        );

        if (ev.canceled)
            return;

        this._usePlatform(true);
    }

    private async _handleSendQuickChat(rpc: SendQuickChatMessage) {
        await this.emit(
            new PlayerSendQuickChatEvent(
                this.room,
                this.player,
                rpc,
                rpc.message
            )
        );
    }

    private _rpcSendQuickChat(message: QuickChatMessageData) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SendQuickChatMessage(message)
            )
        );
    }

    /**
     * Send a quick chat message as this player.
     *
     * Due to technical impossibilities, this event cannot be canceled or reverted.
     *
     * Emits a {@link PlayerSendChatEvent | `player.quickchat`} event.
     */
    sendQuickChat(message: PlayerData|StringNames, format?: (PlayerData|StringNames)[]) {
        const quickChatMessage = typeof message === "number"
            ? format
                ? new QuickChatSentenceMessageData(message, format.map(format => {
                    return typeof format === "number"
                        ? format
                        : new QuickChatPlayerMessageData(format.playerId!);
                }))
                : new QuickChatPhraseMessageData(message)
            : new QuickChatPlayerMessageData(message.playerId!);

        this.emit(
            new PlayerSendQuickChatEvent(
                this.room,
                this.player,
                undefined,
                quickChatMessage
            )
        );
        this._rpcSendQuickChat(quickChatMessage);
    }

    private async _handleSetHat(rpc: SetHatMessage) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldHat = defaultOutfit?.hatId;
        if (defaultOutfit)
            defaultOutfit.hatId = rpc.hatId;

        const ev = await this.emit(
            new PlayerSetHatEvent(
                this.room,
                this.player,
                rpc,
                oldHat || Hat.NoHat,
                rpc.hatId
            )
        );

        playerInfo?.setHat(PlayerOutfitType.Default, ev.alteredHatId);

        if (ev.alteredHatId !== rpc.hatId)
            this._rpcSetHat(ev.alteredHatId);
    }

    private _rpcSetHat(hatId: string) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SetHatMessage(hatId)
            )
        );
    }

    /**
     * Update this player's hat. This is not a host operation unless the
     * client does not own this player.
     *
     * Emits a {@link PlayerSetHatEvent | `player.sethat`} event.
     *
     * @param hatId The hat to set this player's hat to, see {@link Hat}.
     */
    async setHat(hatId: string) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldHat = defaultOutfit?.hatId;
        if (defaultOutfit)
            defaultOutfit.hatId = hatId;

        const ev = await this.emit(
            new PlayerSetHatEvent(
                this.room,
                this.player,
                undefined,
                oldHat || Hat.NoHat,
                hatId
            )
        );

        playerInfo?.setHat(PlayerOutfitType.Default, ev.alteredHatId);

        if (ev.alteredHatId !== oldHat)
            this._rpcSetHat(ev.alteredHatId);
    }

    private async _handleSetSkin(rpc: SetSkinMessage) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldSkin = defaultOutfit?.skinId;
        if (defaultOutfit)
            defaultOutfit.skinId = rpc.skinId;

        const ev = await this.emit(
            new PlayerSetSkinEvent(
                this.room,
                this.player,
                rpc,
                oldSkin || Skin.None,
                rpc.skinId
            )
        );

        playerInfo?.setSkin(PlayerOutfitType.Default, ev.alteredSkin);

        if (ev.alteredSkin !== rpc.skinId)
            this._rpcSetSkin(ev.alteredSkin);
    }

    private _rpcSetSkin(skinId: string) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SetSkinMessage(skinId)
            )
        );
    }

    /**
     * Update this player's skin. This is not a host operation unless the
     * client does not own this player.
     *
     * Emits a {@link PlayerSetSkinEvent | `player.setskin`} event.
     *
     * @param skinId The skin to set this player's skin to, see {@link Skin}.
     */
    async setSkin(skinId: string) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldSkin = defaultOutfit?.skinId;
        if (defaultOutfit)
            defaultOutfit.skinId = skinId;

        const ev = await this.emit(
            new PlayerSetSkinEvent(
                this.room,
                this.player,
                undefined,
                oldSkin || Skin.None,
                skinId
            )
        );

        playerInfo?.setSkin(PlayerOutfitType.Default, ev.alteredSkin);

        if (ev.alteredSkin !== oldSkin)
            this._rpcSetSkin(ev.alteredSkin);
    }

    private async _handleSetPet(rpc: SetPetMessage) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldPet = defaultOutfit?.petId;
        if (defaultOutfit)
            defaultOutfit.petId = rpc.petId;

        const ev = await this.emit(
            new PlayerSetPetEvent(
                this.room,
                this.player,
                rpc,
                oldPet || Pet.EmptyPet,
                rpc.petId
            )
        );

        playerInfo?.setPet(PlayerOutfitType.Default, ev.alteredPetId);

        if (ev.alteredPetId !== rpc.petId)
            this._rpcSetPet(ev.alteredPetId);
    }

    private _rpcSetPet(petId: string) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SetPetMessage(petId)
            )
        );
    }

    /**
     * Update this player's pet. This is not a host operation unless the
     * client does not own this player.
     *
     * Emits a {@link PlayerSetPetEvent | `player.setpet`} event.
     *
     * @param petId The pet to set this player's pet to, see {@link Pet}.
     */
    async setPet(petId: string) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldPet = defaultOutfit?.petId;
        if (defaultOutfit)
            defaultOutfit.petId = petId;

        const ev = await this.emit(
            new PlayerSetPetEvent(
                this.room,
                this.player,
                undefined,
                oldPet || Pet.EmptyPet,
                petId
            )
        );

        playerInfo?.setPet(PlayerOutfitType.Default, ev.alteredPetId);

        if (ev.alteredPetId !== oldPet)
            this._rpcSetPet(ev.alteredPetId);
    }

    private async _handleSetVisor(rpc: SetVisorMessage) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldVisor = defaultOutfit?.visorId;
        if (defaultOutfit)
            defaultOutfit.visorId = rpc.visorId;

        const ev = await this.emit(
            new PlayerSetVisorEvent(
                this.room,
                this.player,
                rpc,
                oldVisor || Visor.EmptyVisor,
                rpc.visorId
            )
        );

        playerInfo?.setVisor(PlayerOutfitType.Default, ev.alteredVisorId);

        if (ev.alteredVisorId !== rpc.visorId)
            this._rpcSetVisor(ev.alteredVisorId);
    }

    private _rpcSetVisor(visorId: string) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SetPetMessage(visorId)
            )
        );
    }

    /**
     * Update this player's visor. This is not a host operation unless the
     * client does not own this player.
     *
     * Emits a {@link PlayerSetVisorEvent | `player.setvisor`} event.
     *
     * @param visorId The visor to set this player's visor to, see {@link Visor}.
     */
    async setVisor(visorId: string) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldVisor = defaultOutfit?.visorId;
        if (defaultOutfit)
            defaultOutfit.visorId = visorId;

        const ev = await this.emit(
            new PlayerSetVisorEvent(
                this.room,
                this.player,
                undefined,
                oldVisor || Visor.EmptyVisor,
                visorId
            )
        );

        playerInfo?.setVisor(PlayerOutfitType.Default, ev.alteredVisorId);

        if (ev.alteredVisorId !== oldVisor)
            this._rpcSetVisor(ev.alteredVisorId);
    }

    private async _handleSetNameplate(rpc: SetNameplateMessage) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldNameplate = defaultOutfit?.nameplateId;
        if (defaultOutfit)
            defaultOutfit.nameplateId = rpc.nameplateId;

        const ev = await this.emit(
            new PlayerSetNameplateEvent(
                this.room,
                this.player,
                rpc,
                oldNameplate || Nameplate.NoPlate,
                rpc.nameplateId
            )
        );

        playerInfo?.setNameplate(PlayerOutfitType.Default, ev.alteredNameplateId);

        if (ev.alteredNameplateId !== rpc.nameplateId)
            this._rpcSetNameplate(ev.alteredNameplateId);
    }

    private _rpcSetNameplate(nameplateId: string) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SetPetMessage(nameplateId)
            )
        );
    }

    /**
     * Update this player's nameplate. This is not a host operation unless the
     * client does not own this player.
     *
     * Emits a {@link PlayerSetNameplateEvent | `player.setnameplate`} event.
     *
     * @param nameplateId The nameplate to set this player's nameplate to, see {@link Nameplate}.
     */
    async setNameplate(nameplateId: string) {
        const playerInfo = this.room.gameData?.players.get(this.playerId);
        const defaultOutfit = playerInfo?.getOutfit(PlayerOutfitType.Default);
        const oldNameplate = defaultOutfit?.nameplateId;
        if (defaultOutfit)
            defaultOutfit.nameplateId = nameplateId;

        const ev = await this.emit(
            new PlayerSetNameplateEvent(
                this.room,
                this.player,
                undefined,
                oldNameplate || Nameplate.NoPlate,
                nameplateId
            )
        );

        playerInfo?.setNameplate(PlayerOutfitType.Default, ev.alteredNameplateId);

        if (ev.alteredNameplateId !== oldNameplate)
            this._rpcSetNameplate(ev.alteredNameplateId);
    }

    private async _handleCheckMurder(rpc: CheckMurderMessage) {
        const victim = this.room.getPlayerByNetId(rpc.victimNetId);

        if (!victim || !this.room.hostIsMe)
            return;

        const ev = await this.emit(
            new PlayerCheckMurderEvent(
                this.room,
                this.player,
                rpc,
                victim,
                this.room.murderIsValid(this.player, victim)
            )
        );

        if (ev.alteredIsValid) {
            ev.alteredPlayer.control?.murderPlayer(ev.alteredVictim);
        }
    }

    private async _rpcCheckMurder(victim: PlayerData) {
        if (!victim.control)
            return;

        await this.room.broadcast([
            new RpcMessage(
                this.netId,
                new CheckMurderMessage(
                    victim.control.netId
                )
            )
        ]);
    }
}
