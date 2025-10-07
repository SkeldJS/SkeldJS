import { HazelReader, HazelWriter } from "@skeldjs/util";

import {
    BaseRpcMessage,
    CheckColorMessage,
    CheckMurderMessage,
    CheckNameMessage,
    CheckProtectMessage,
    CompleteTaskMessage,
    ComponentSpawnData,
    GameSettings,
    MurderPlayerMessage,
    ProtectPlayerMessage,
    QuickChatComplexMessageData,
    QuickChatMessageData,
    QuickChatPlayerMessageData,
    QuickChatSimpleMessageData,
    ReportDeadBodyMessage,
    RpcMessage,
    SendChatMessage,
    SendChatNoteMessage,
    SendQuickChatMessage,
    SetColorMessage,
    SetHatMessage,
    SetLevelMessage,
    SetNameMessage,
    SetNameplateMessage,
    SetPetMessage,
    SetRoleMessage,
    SetSkinMessage,
    SetStartCounterMessage,
    SetVisorMessage,
    ShapeshiftMessage,
    SpawnMessage,
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
    Nameplate,
    RoleType,
    GameState,
    RoleTeamType,
    SpawnFlag
} from "@skeldjs/constant";

import { ExtractEventTypes } from "@skeldjs/events";

import {
    PlayerCheckColorEvent,
    PlayerCheckNameEvent,
    PlayerCompleteTaskEvent,
    PlayerUseMovingPlatformEvent,
    PlayerMurderEvent,
    PlayerRemoveProtectionEvent,
    PlayerReportDeadBodyEvent,
    PlayerSendChatEvent,
    PlayerSendQuickChatEvent,
    PlayerSetColorEvent,
    PlayerSetHatEvent,
    PlayerSetNameEvent,
    PlayerSetPetEvent,
    PlayerSetSkinEvent,
    PlayerSetStartCounterEvent,
    PlayerStartMeetingEvent,
    PlayerSyncSettingsEvent,
    PlayerDieEvent,
    PlayerSetVisorEvent,
    PlayerSetNameplateEvent,
    PlayerCheckMurderEvent,
    PlayerSetRoleEvent,
    PlayerProtectEvent,
    PlayerCheckProtectEvent,
    PlayerShapeshiftEvent,
    PlayerRevertShapeshiftEvent,
    PlayerSetLevelEvent
} from "../events";

import { NetworkedObject, NetworkedObjectEvents, NetworkedObjectConstructor } from "../NetworkedObject";
import { StatefulRoom, SpecialOwnerId } from "../StatefulRoom";
import { Player } from "../Player";

import { LobbyBehaviour } from "./LobbyBehaviour";
import { MeetingHud } from "./MeetingHud";

import { CustomNetworkTransform, PlayerPhysics } from "./component";
import { MovingPlatformSide, MovingPlatformSystem } from "../systems";
import { AmongUsEndGames, EndGameIntent, PlayersKillEndgameMetadata } from "../endgame";
import { BaseRole, GuardianAngelRole, UnknownRole } from "../roles";
import { sequenceIdGreaterThan, SequenceIdType } from "../utils/sequenceIds";

export type PlayerControlEvents<RoomType extends StatefulRoom> = NetworkedObjectEvents<RoomType> &
    ExtractEventTypes<
        [
            PlayerCheckColorEvent<RoomType>,
            PlayerCheckMurderEvent<RoomType>,
            PlayerCheckNameEvent<RoomType>,
            PlayerCheckProtectEvent<RoomType>,
            PlayerCompleteTaskEvent<RoomType>,
            PlayerDieEvent<RoomType>,
            PlayerUseMovingPlatformEvent<RoomType>,
            PlayerMurderEvent<RoomType>,
            PlayerProtectEvent<RoomType>,
            PlayerRemoveProtectionEvent<RoomType>,
            PlayerReportDeadBodyEvent<RoomType>,
            PlayerRevertShapeshiftEvent<RoomType>,
            PlayerSendChatEvent<RoomType>,
            PlayerSendQuickChatEvent<RoomType>,
            PlayerSetColorEvent<RoomType>,
            PlayerSetHatEvent<RoomType>,
            PlayerSetLevelEvent<RoomType>,
            PlayerSetNameEvent<RoomType>,
            PlayerSetNameplateEvent<RoomType>,
            PlayerSetPetEvent<RoomType>,
            PlayerSetRoleEvent<RoomType>,
            PlayerSetSkinEvent<RoomType>,
            PlayerSetStartCounterEvent<RoomType>,
            PlayerSetVisorEvent<RoomType>,
            PlayerShapeshiftEvent<RoomType>,
            PlayerStartMeetingEvent<RoomType>,
            PlayerSyncSettingsEvent<RoomType>
        ]
    >;

/**
 * Represents a player object for interacting with the game and other players.
 *
 * See {@link PlayerControlEvents} for events to listen to.
 */
export class PlayerControl<RoomType extends StatefulRoom> extends NetworkedObject<RoomType, PlayerControlEvents<RoomType>> {
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
    player: Player<RoomType>;

    /**
     * Whether or not this player has been protected bya guardian angel.
     */
    protectedByGuardian: boolean;

    /**
     * The player (i.e. a guardian angel) who has protected this player, if the
     * player is being protected..
     */
    guardianProtector?: Player<RoomType>;

    /**
     * The player that this player has shapeshifted as, if any.
     */
    shapeshiftTarget?: Player<RoomType>;

    private _protectedByGuardianTime: number;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
    ) {
        super(room, spawnType, netId, ownerId, flags);

        this.isNew ??= true;
        this.playerId ||= 0;

        this.player = this.owner as Player<RoomType>;

        this.protectedByGuardian = false;
        this._protectedByGuardianTime = 0;
    }

    async processAwake() {
        this.playerId ??= this.room.getAvailablePlayerID();

        if (this.isNew) {
            if (this.room.lobbyBehaviour) {
                const spawnPosition = LobbyBehaviour.spawnPositions[this.playerId % LobbyBehaviour.spawnPositions.length];
                const offsetted = spawnPosition
                    .add(spawnPosition.negate().normalize().div(4));

                await this.getComponentSafe(2, CustomNetworkTransform)!.snapTo(offsetted, false);
            } else if (this.room.shipStatus) {
                const spawnPosition = this.room.shipStatus.getSpawnPosition(this.playerId, true);
                await this.getComponentSafe(2, CustomNetworkTransform)!.snapTo(spawnPosition, false);
            }
        }
    }

    getPlayerInfo() {
        return this.room.playerInfo.get(this.playerId);
    }

    deserializeFromReader(reader: HazelReader, spawn: boolean = false) {
        if (spawn) {
            this.isNew = reader.bool();
        }

        this.playerId = reader.uint8();
    }

    serializeToWriter(writer: HazelWriter, spawn: boolean = false) {
        if (spawn) {
            writer.bool(this.isNew);
            this.isNew = false;
        }

        writer.uint8(this.playerId);
        return true;
    }

    async processFixedUpdate(delta: number) {
        if (this.protectedByGuardian) {
            this._protectedByGuardianTime -= delta;
            if (this._protectedByGuardianTime <= 0) {
                this._protectedByGuardianTime = 0;
                await this.removeProtection(true);
            }
        }
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {
        switch (rpc.messageTag) {
            case RpcMessageTag.CompleteTask:
                await this._handleCompleteTask(rpc as CompleteTaskMessage);
                break;
            case RpcMessageTag.SyncSettings:
                await this._handleSyncSettings(rpc as SyncSettingsMessage);
                break;
            case RpcMessageTag.CheckName:
                if (this.room.canManageObject(this)) {
                    await this._handleCheckName(rpc as CheckNameMessage);
                }
                break;
            case RpcMessageTag.CheckColor:
                if (this.room.canManageObject(this)) {
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
                if (this.room.canManageObject(this)) {
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
            case RpcMessageTag.SetLevel:
                await this._handleSetLevel(rpc as SetLevelMessage);
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
            case RpcMessageTag.SetRole:
                await this._handleSetRole(rpc as SetRoleMessage);
                break;
            case RpcMessageTag.ProtectPlayer:
                await this._handleProtectPlayer(rpc as ProtectPlayerMessage);
                break;
            case RpcMessageTag.Shapeshift:
                await this._handleShapeshift(rpc as ShapeshiftMessage);
                break;
            case RpcMessageTag.CheckMurder:
                await this._handleCheckMurder(rpc as CheckMurderMessage);
                break;
            case RpcMessageTag.CheckProtect:
                await this._handleCheckProtect(rpc as CheckProtectMessage);
                break;
        }
    }

    private async _handleCompleteTask(rpc: CompleteTaskMessage) {
        const playerInfo = this.getPlayerInfo();
        if (!playerInfo?.taskStates)
            return;

        this._completeTask(rpc.taskIdx);

        await this.emit(
            new PlayerCompleteTaskEvent(
                this.room,
                this.player,
                rpc,
                playerInfo.taskStates[rpc.taskIdx]
            )
        );
    }

    private _completeTask(taskIdx: number) {
        this.getPlayerInfo()?.completeTask(taskIdx);
    }

    private async _rpcCompleteTask(taskIdx: number) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new CompleteTaskMessage(taskIdx)
            )
        );
    }

    /**
     * Mark one of this player's tasks as completed.
     * @param taskIdx The index of the task to complete. Note: this is not the
     * task ID but instead the index of the player's task, as in its position in
     * the {@link PlayerInfo.taskStates} array.
     *
     * Emits a {@link PlayerCompleteTaskEvent | `player.completetask`} event.
     *
     * @example
     * ```ts
     * client.me.control.completeTask(0);
     * ```
     */
    completeTask(taskIdx: number) {
        const taskState = this.getPlayerInfo()?.taskStates[taskIdx];
        if (!taskState)
            return;

        this.emitSync(
            new PlayerCompleteTaskEvent(
                this.room,
                this.player,
                undefined,
                taskState,
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
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SyncSettingsMessage(settings)
            )
        );
    }

    /**
     * Change the room's settings. Use {@link StatefulRoom.setSettings} to pass a
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

    private async _handleCheckName(rpc: CheckNameMessage) {
        let newName = rpc.name;

        const players = [...this.room.playerInfo.values()];
        if (
            players.some(
                (player) =>
                    player.playerId !== this.playerId &&
                    player.defaultOutfit.name.toLowerCase() === newName.toLowerCase()
            )
        ) {
            for (let i = 1; i < 100; i++) {
                newName = rpc.name + " " + i;

                if (
                    !players.some(
                        (player) =>
                            player.playerId !== this.playerId &&
                            player.defaultOutfit.name.toLowerCase() === newName.toLowerCase()
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
        await this.room.broadcastImmediate(
            [
                new RpcMessage(
                    this.netId,
                    new CheckNameMessage(name)
                ),
            ],
            undefined,
            [this.room.authorityId]
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
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
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
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SetNameMessage(this.netId, name)
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
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
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
        const maxColor = Math.max(...Object.values(Color).filter(x => typeof x === "number") as number[]);
        const set: Partial<Record<Color, boolean>> = {};

        for (const [ , playerInfo ] of this.room.playerInfo) {
            if (playerInfo.playerId === this.playerId) continue;
            set[playerInfo.defaultOutfit.color] = true;
        }

        var newColor = rpc.color;
        while (true) {
            if (newColor >= maxColor) {
                newColor = 0;
                break;
            }
            if (!set[newColor]) break;
            newColor++;
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
        await this.room.broadcastImmediate(
            [
                new RpcMessage(
                    this.netId,
                    new CheckColorMessage(color)
                ),
            ],
            undefined,
            [this.room.authorityId]
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
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
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
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SetColorMessage(this.netId, color)
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
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
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
            this.startMeeting(ev.alteredBody, this.player);
        }
    }

    private async _rpcReportDeadBody(body: Player<RoomType> | "emergency"): Promise<void> {
        if (body !== "emergency" && body.getPlayerId() === undefined) {
            return this._rpcReportDeadBody("emergency");
        }

        await this.room.broadcastImmediate([
            new RpcMessage(
                this.netId,
                new ReportDeadBodyMessage(
                    body === "emergency"
                        ? 0xff
                        : body.getPlayerId()!
                )
            )
        ], undefined, [this.room.authorityId]);
    }

    async kill(reason: string) {
        const playerInfo = this.getPlayerInfo();

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
        const victimPlayerInfo = victim?.getPlayerInfo();

        if (!victim)
            return;

        await victim.characterControl?.kill("murder");

        await this.emit(
            new PlayerMurderEvent(
                this.room,
                this.player,
                rpc,
                victim
            )
        );

        this._checkMurderEndGame();

        if (victimPlayerInfo?.isDead && this.room.canManageObject(this)) {
            // await this.room.shipStatus?.tryAssignGhostRole(victim); todo: fix
        }
    }

    private _rpcMurderPlayer(victim: Player<RoomType>) {
        if (!victim.characterControl)
            return;

        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new MurderPlayerMessage(victim.characterControl.netId)
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
    async murderPlayer(victim: Player<RoomType>) {
        const victimPlayerInfo = victim?.getPlayerInfo();

        if (!this.room.canManageObject(this)) {
            await this._rpcCheckMurder(victim);
            return;
        }

        if (victim.characterControl?.protectedByGuardian) {
            this._rpcMurderPlayer(victim);
            await victim.characterControl.removeProtection();
            return;
        }

        await victim.characterControl?.kill("murder");

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

        if (victimPlayerInfo?.isDead && this.room.canManageObject(this)) {
            // await this.room.shipStatus?.tryAssignGhostRole(victim); todo: fix
        }
    }

    private _checkMurderEndGame(victim?: Player<RoomType>) {
        let aliveCrewmates = 0;
        let aliveImpostors = 0;
        for (const [, playerInfo] of this.room.playerInfo) {
            if (!playerInfo.isDisconnected && !playerInfo.isDead) {
                if (playerInfo.isImpostor) {
                    aliveImpostors++;
                } else {
                    aliveCrewmates++;
                }
            }
        }

        if (aliveCrewmates <= aliveImpostors) {
            this.room.registerEndGameIntent(
                new EndGameIntent<PlayersKillEndgameMetadata<RoomType>>(
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
        this.room.broadcastLazy(
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
    async sendChat(message: string) {
        await this.emit(
            new PlayerSendChatEvent(
                this.room,
                this.player,
                undefined,
                message
            )
        );
        this._rpcSendChat(message);
    }

    private _rpcSendChatNote(player: Player<RoomType>, type: ChatNoteType) {
        const playerId = player.getPlayerId();
        if (playerId === undefined)
            return;

        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SendChatNoteMessage(playerId, type)
            )
        );
    }

    /**
     * Send a player chat note for this player, i.e. "player x voted, x remaining.".
     */
    sendChatNote(player: Player<RoomType>, type: ChatNoteType) {
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

        if (this.room.canManageObject(this)) {
            await this._startMeeting(this.player);
        }
    }

    private async _startMeeting(caller: Player<RoomType>) {
        const callerPlayerId = caller.getPlayerId();
        if (callerPlayerId === undefined)
            return;

        const spawnMeetingHud = await this.room.createObjectOfType(
            SpawnType.MeetingHud,
            SpecialOwnerId.Global,
            SpawnFlag.None
        ) as MeetingHud<RoomType>;

        await spawnMeetingHud.processAwake();

        const callerState = spawnMeetingHud.voteStates.get(callerPlayerId);
        if (callerState) {
            callerState.didReport = true;
        }

        this.room.broadcastLazy(this.room.createObjectSpawnMessage(spawnMeetingHud));

        this.room.shipStatus?.systems.get(SystemType.Laboratory)?.fullyRepairHost();
        this.room.shipStatus?.systems.get(SystemType.Reactor)?.fullyRepairHost();
        this.room.shipStatus?.systems.get(SystemType.O2)?.fullyRepairHost();

        const movingPlatform = this.room.shipStatus?.systems.get(SystemType.GapRoom);
        if (movingPlatform instanceof MovingPlatformSystem) {
            movingPlatform.setSide(MovingPlatformSide.Left);
        }

        for (const [, player] of this.room.players) {
            const playerPhysics = player.characterControl?.getComponentSafe(1, PlayerPhysics);
            if (playerPhysics && playerPhysics.ventId !== -1) {
                playerPhysics.exitVent(playerPhysics.ventId)
            }
        }

        this.room.broadcastLazy(
            new SpawnMessage(
                SpawnType.MeetingHud,
                SpecialOwnerId.Global,
                0,
                spawnMeetingHud.components.map((component) => {
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

    private _rpcStartMeeting(player: Player<RoomType> | "emergency"): void {
        if (player !== "emergency" && player.getPlayerId() === undefined) {
            return this._rpcStartMeeting("emergency");
        }

        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new StartMeetingMessage(
                    player === "emergency"
                        ? 0xff
                        : player.getPlayerId()!
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
     * @param body The body that was reported, or "emergency" if it is an emergency meeting.
     * @param caller The player that called this meeting.
     */
    async startMeeting(body: Player<RoomType> | "emergency", caller?: Player<RoomType>) {
        if (!this.room.canManageObject(this)) {
            await this._rpcReportDeadBody(body);
            return;
        }

        const actualCaller = caller || this.room.playerAuthority || this.player;
        this._rpcStartMeeting(body);
        await this._startMeeting(actualCaller);

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
        this.room.broadcastLazy(
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

        if (!airship || !this.room.canManageObject(this))
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

        if (!airship)
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
        this.room.broadcastLazy(
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
    sendQuickChat(message: Player<RoomType> | StringNames, format?: (Player<RoomType> | StringNames)[]) {
        const quickChatMessage = typeof message === "number"
            ? format
                ? new QuickChatComplexMessageData(message, format.map(format => {
                    return typeof format === "number"
                        ? new QuickChatSimpleMessageData(format)
                        : new QuickChatPlayerMessageData(format.getPlayerId()!);
                }))
                : new QuickChatSimpleMessageData(message)
            : new QuickChatPlayerMessageData(message.getPlayerId()!);

        this.emitSync(
            new PlayerSendQuickChatEvent(
                this.room,
                this.player,
                undefined,
                quickChatMessage
            )
        );
        this._rpcSendQuickChat(quickChatMessage);
    }

    private async _handleSetLevel(rpc: SetLevelMessage) {
        const playerInfo = this.getPlayerInfo();
        const oldLevel = playerInfo?.playerLevel || 0;
        playerInfo?.setLevel(rpc.level);

        const ev = await this.emit(
            new PlayerSetLevelEvent(
                this.room,
                this.player,
                undefined,
                oldLevel,
                rpc.level,
            )
        );

        if (ev.alteredLevel !== rpc.level)
            this._rpcSetLevel(ev.alteredLevel);
    }

    private _rpcSetLevel(level: number) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SetLevelMessage(level),
            )
        );
    }

    async setLevel(level: number) {
        const playerInfo = this.getPlayerInfo();
        const oldLevel = playerInfo?.playerLevel || 0;
        playerInfo?.setLevel(level);

        const ev = await this.emit(
            new PlayerSetLevelEvent(
                this.room,
                this.player,
                undefined,
                oldLevel,
                level,
            )
        );

        if (ev.alteredLevel !== oldLevel)
            this._rpcSetLevel(ev.alteredLevel);
    }

    private async _handleSetHat(rpc: SetHatMessage) {
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
        const oldHat = defaultOutfit?.hatId;

        if (defaultOutfit) {
            if (!sequenceIdGreaterThan(rpc.sequenceId, defaultOutfit.hatSequenceId, SequenceIdType.Byte)) return;
            defaultOutfit.hatId = rpc.hatId;
        }

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
            this._rpcSetHat(ev.alteredHatId, defaultOutfit?.nextHatSequenceId() || 0);
    }

    private _rpcSetHat(hatId: string, sequenceId: number) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SetHatMessage(hatId, sequenceId)
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
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
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
            this._rpcSetHat(ev.alteredHatId, defaultOutfit?.nextHatSequenceId() || 0);
    }

    private async _handleSetSkin(rpc: SetSkinMessage) {
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
        const oldSkin = defaultOutfit?.skinId;

        if (defaultOutfit) {
            if (!sequenceIdGreaterThan(rpc.sequenceId, defaultOutfit.skinSequenceId, SequenceIdType.Byte)) return;
            defaultOutfit.skinId = rpc.skinId;
        }

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
            this._rpcSetSkin(ev.alteredSkin, defaultOutfit?.nextSkinSequenceId() || 0);
    }

    private _rpcSetSkin(skinId: string, sequenceId: number) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SetSkinMessage(skinId, sequenceId)
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
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
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
            this._rpcSetSkin(ev.alteredSkin, defaultOutfit?.nextSkinSequenceId() || 0);
    }

    private async _handleSetPet(rpc: SetPetMessage) {
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
        const oldPet = defaultOutfit?.petId;
        if (defaultOutfit) {
            if (!sequenceIdGreaterThan(rpc.sequenceId, defaultOutfit.petSequenceId, SequenceIdType.Byte)) return;
            defaultOutfit.petId = rpc.petId;
        }

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
            this._rpcSetPet(ev.alteredPetId, defaultOutfit?.nextPetSequenceId() || 0);
    }

    private _rpcSetPet(petId: string, sequenceId: number) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SetPetMessage(petId, sequenceId)
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
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
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
            this._rpcSetPet(ev.alteredPetId, defaultOutfit?.nextPetSequenceId() || 0);
    }

    private async _handleSetVisor(rpc: SetVisorMessage) {
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
        const oldVisor = defaultOutfit?.visorId;
        if (defaultOutfit) {
            if (!sequenceIdGreaterThan(rpc.sequenceId, defaultOutfit.visorSequenceId, SequenceIdType.Byte)) return;
            defaultOutfit.visorId = rpc.visorId;
        }

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
            this._rpcSetVisor(ev.alteredVisorId, defaultOutfit?.nextVisorSequenceId() || 0);
    }

    private _rpcSetVisor(visorId: string, sequenceId: number) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SetVisorMessage(visorId, sequenceId)
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
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
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
            this._rpcSetVisor(ev.alteredVisorId, defaultOutfit?.nextVisorSequenceId() || 0);
    }

    private async _handleSetNameplate(rpc: SetNameplateMessage) {
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
        const oldNameplate = defaultOutfit?.nameplateId;
        if (defaultOutfit) {
            if (!sequenceIdGreaterThan(rpc.sequenceId, defaultOutfit.nameplateSequenceId, SequenceIdType.Byte)) return;
            defaultOutfit.nameplateId = rpc.nameplateId;
        }

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
            this._rpcSetNameplate(ev.alteredNameplateId, defaultOutfit?.nextNameplateSequenceId() || 0);
    }

    private _rpcSetNameplate(nameplateId: string, sequenceId: number) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SetNameplateMessage(nameplateId, sequenceId)
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
        const playerInfo = this.getPlayerInfo();
        const defaultOutfit = playerInfo?.defaultOutfit;
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
            this._rpcSetNameplate(ev.alteredNameplateId, defaultOutfit?.nextNameplateSequenceId() || 0);
    }

    private async _handleSetRole(rpc: SetRoleMessage) {
        const playerInfo = this.getPlayerInfo();
        if (!playerInfo)
            return;

        const oldRoleType = playerInfo.roleType;
        const newRole = this.room.registeredRoles.get(rpc.roleType) || UnknownRole(rpc.roleType);
        playerInfo.roleType = newRole;
        this.player.role = new newRole(this.player);
        if (newRole.roleMetadata.roleType !== RoleType.ImpostorGhost && newRole.roleMetadata.roleType !== RoleType.CrewmateGhost) {
            playerInfo.roleTypeWhenAlive = newRole;
        }

        const ev = await this.emit(
            new PlayerSetRoleEvent(
                this.room,
                this.player,
                rpc,
                oldRoleType,
                newRole
            )
        );

        if (ev.alteredRole !== newRole) {
            this._rpcSetRole(ev.alteredRole?.roleMetadata.roleType || RoleType.Crewmate);
            playerInfo.roleType = ev.alteredRole;
            this.player.role = new ev.alteredRole(this.player);
        }

        await this.player.role.onInitialize();
    }

    private _rpcSetRole(roleType: RoleType) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new SetRoleMessage(roleType)
            )
        );
    }

    async setRole(roleCtr: typeof BaseRole) {
        const playerInfo = this.getPlayerInfo();
        if (!playerInfo)
            return;

        const oldRoleType = playerInfo.roleType;
        playerInfo.setRoleType(roleCtr);
        this.player.role = new roleCtr(this.player);
        if (roleCtr.roleMetadata.roleType !== RoleType.ImpostorGhost && roleCtr.roleMetadata.roleType !== RoleType.CrewmateGhost) {
            playerInfo.roleTypeWhenAlive = roleCtr;
        }

        const ev = await this.emit(
            new PlayerSetRoleEvent(
                this.room,
                this.player,
                undefined,
                oldRoleType,
                roleCtr
            )
        );

        if (ev.canceled) {
            playerInfo.roleType = oldRoleType;
            this.player.role = oldRoleType ? new oldRoleType(this.player) : undefined;
            return;
        }

        if (ev.alteredRole !== roleCtr) {
            playerInfo.roleType = ev.alteredRole;
            this.player.role = new ev.alteredRole(this.player);
        }
        this._rpcSetRole(ev.alteredRole?.roleMetadata.roleType || RoleType.Crewmate);

        await this.player.role.onInitialize();
    }

    private async _handleProtectPlayer(rpc: ProtectPlayerMessage) {
        const target = this.room.getPlayerByNetId(rpc.targetNetId);

        if (!target)
            return;

        target.characterControl?._addProtection(this.player);

        await this.emit(
            new PlayerProtectEvent(
                this.room,
                this.player,
                rpc,
                target,
                this.room.settings.roleSettings.guardianAngelPotectionDuration
            )
        );
    }

    private _addProtection(guardianProtector: Player<RoomType>) {
        this.protectedByGuardian = true;
        this.guardianProtector = guardianProtector;
        this._protectedByGuardianTime = this.room.settings.roleSettings.guardianAngelPotectionDuration;
    }

    private _rpcProtectPlayer(target: Player<RoomType>, angelColor: Color) {
        if (!target.characterControl)
            return;

        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new ProtectPlayerMessage(
                    target.characterControl.netId,
                    angelColor
                )
            )
        );
    }

    async protectPlayer(target: Player<RoomType>, angelColor = this.getPlayerInfo()?.defaultOutfit.color || Color.Red) {
        if (!this.room.canManageObject(this)) {
            await this._rpcCheckProtect(target);
            return;
        }

        target.characterControl?._addProtection(this.player);
        this._rpcProtectPlayer(target, angelColor);

        await this.emit(
            new PlayerProtectEvent(
                this.room,
                this.player,
                undefined,
                target,
                this.room.settings.roleSettings.guardianAngelPotectionDuration,
            )
        );
    }

    private async _handleShapeshift(rpc: ShapeshiftMessage) {
        const target = this.room.getPlayerByNetId(rpc.targetNetId);

        if (!target)
            return;

        const oldTarget = this.shapeshiftTarget;
        if (target === this.player) {
            if (!oldTarget)
                return;

            this._shapeshift(target);
            const ev = await this.emit(
                new PlayerRevertShapeshiftEvent(
                    this.room,
                    this.player,
                    undefined,
                    oldTarget,
                    rpc.doAnimation
                )
            );

            if (ev.reverted) {
                this._shapeshift(oldTarget);
                this._rpcShapeshift(oldTarget, ev.alteredDoAnimation);
                return;
            }
        } else {
            this._shapeshift(target);

            const ev = await this.emit(
                new PlayerShapeshiftEvent(
                    this.room,
                    this.player,
                    undefined,
                    target,
                    this.room.settings.roleSettings.shapeshiftDuration,
                    rpc.doAnimation
                )
            );

            if (ev.reverted) {
                this._shapeshift(this.player);
                this._rpcShapeshift(target, ev.alteredDoAnimation);
                return;
            }

            if (ev.alteredTarget !== target) {
                this._shapeshift(ev.alteredTarget);
                this._rpcShapeshift(ev.alteredTarget, ev.alteredDoAnimation);
                return;
            }
        }
    }

    private _shapeshift(target: Player<RoomType>) {
        this.shapeshiftTarget = target === this.player
            ? undefined
            : target;

        const thisPlayerInfo = this.getPlayerInfo();
        const targetPlayerInfo = target.getPlayerInfo();

        if (!thisPlayerInfo || !targetPlayerInfo || !this.getPlayerInfo())
            return;


        if (target === this.player) {
            thisPlayerInfo.deleteOutfit(PlayerOutfitType.Shapeshifter);
        } else {
            thisPlayerInfo.setOutfit(targetPlayerInfo.defaultOutfit.clone(PlayerOutfitType.Shapeshifter));
            thisPlayerInfo.currentOutfitType = PlayerOutfitType.Shapeshifter;
        }
    }

    private _rpcShapeshift(target: Player<RoomType>, doAnimation: boolean) {
        if (!target.characterControl)
            return;

        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new ShapeshiftMessage(
                    target.characterControl.netId,
                    doAnimation
                )
            )
        );
    }

    async shapeshift(target: Player<RoomType>, doAnimation = true) {
        const oldTarget = this.shapeshiftTarget;

        if (target === this.player) {
            if (!oldTarget)
                return;

            this._shapeshift(target);
            const ev = await this.emit(
                new PlayerRevertShapeshiftEvent(
                    this.room,
                    this.player,
                    undefined,
                    oldTarget,
                    doAnimation
                )
            );

            if (ev.reverted) {
                this._shapeshift(oldTarget);
                return;
            }

            this._rpcShapeshift(target, ev.alteredDoAnimation);
        } else {
            this._shapeshift(target);

            const ev = await this.emit(
                new PlayerShapeshiftEvent(
                    this.room,
                    this.player,
                    undefined,
                    target,
                    this.room.settings.roleSettings.shapeshiftDuration,
                    doAnimation
                )
            );

            if (ev.reverted) {
                this._shapeshift(this.player);
                return;
            }

            if (ev.alteredTarget !== target) {
                this._shapeshift(ev.alteredTarget);
                this._rpcShapeshift(ev.alteredTarget, ev.alteredDoAnimation);
                return;
            }

            this._rpcShapeshift(target, doAnimation);
        }
    }

    async revertShapeshift() {
        await this.shapeshift(this.player);
    }
    
    canMurder(victim: PlayerControl<RoomType>) {
        if (this.room.gameState !== GameState.Started)
            return false;

        const murdererPlayerInfo = this.getPlayerInfo();
        const victimPlayerInfo = victim.getPlayerInfo();

        if (murdererPlayerInfo?.isDead || !murdererPlayerInfo?.roleType || murdererPlayerInfo?.roleType.roleMetadata.roleTeam !== RoleTeamType.Impostor || murdererPlayerInfo?.isDisconnected) {
            return false;
        }

        const victimPhysics = victim.getComponentSafe(1, PlayerPhysics);

        if (!victimPlayerInfo || victimPlayerInfo.isDead || victimPhysics?.isInVent) {
            return false;
        }

        return true;
    }

    private async _handleCheckMurder(rpc: CheckMurderMessage) {
        const victim = this.room.getPlayerByNetId(rpc.victimNetId);

        if (!victim || !victim.characterControl || !this.room.canManageObject(this))
            return;

        const ev = await this.emit(
            new PlayerCheckMurderEvent(
                this.room,
                this.player,
                rpc,
                victim,
                this.canMurder(victim.characterControl),
            )
        );

        if (ev.alteredIsValid) {
            ev.alteredPlayer.characterControl?.murderPlayer(ev.alteredVictim);
        }
    }

    private async _rpcCheckMurder(victim: Player<RoomType>) {
        if (!victim.characterControl)
            return;

        await this.room.broadcastImmediate([
            new RpcMessage(
                this.netId,
                new CheckMurderMessage(
                    victim.characterControl.netId
                )
            )
        ]);
    }

    /**
     * Remove this player's protection from a guardian angel, if they have one.
     *
     * Emits a {@link PlayerRemoveProtectionEvent | `player.removeprotection`} event.
     * This is not networked, so other players will not see this update.
     *
     * @param timeout Whether or not this is because of a timeout.
     */
    async removeProtection(timeout = false) {
        if (!this.protectedByGuardian)
            return;

        const oldGuardian = this.guardianProtector;
        this.protectedByGuardian = false;
        this.guardianProtector = undefined;
        const ev = await this.emit(
            new PlayerRemoveProtectionEvent(
                this.room,
                this.player,
                true
            )
        );
        if (ev.reverted) {
            this.protectedByGuardian = true;
            this.guardianProtector = oldGuardian;
            // In case this event was emitted when the timer ran out & it was reverted,
            // we can ensure that it would never be called again for timer running out
            // by setting the timer to Infinity.
            this._protectedByGuardianTime = Infinity;
        }
    }

    private _protectIsValid(target: Player<RoomType>) {
        if (this.room.gameState !== GameState.Started)
            return false;

        const thisPlayerInfo = this.getPlayerInfo();
        const targetPlayerInfo = target.getPlayerInfo();

        if (!thisPlayerInfo || !targetPlayerInfo || thisPlayerInfo.roleType !== GuardianAngelRole || thisPlayerInfo.isImpostor || thisPlayerInfo.isDisconnected || targetPlayerInfo.isDead)
            return false;

        return true;
    }

    private async _handleCheckProtect(rpc: CheckProtectMessage) {
        const target = this.room.getPlayerByNetId(rpc.targetNetId);

        if (!target || !this.room.canManageObject(this))
            return;

        const ev = await this.emit(
            new PlayerCheckProtectEvent(
                this.room,
                this.player,
                rpc,
                target,
                this._protectIsValid(target)
            )
        );

        if (ev.alteredIsValid) {
            await ev.alteredPlayer.characterControl?.protectPlayer(ev.alteredTarget);
        }
    }

    private async _rpcCheckProtect(target: Player<StatefulRoom>) {
        if (!target.characterControl)
            return;

        const targetPlayerInfo = target.getPlayerInfo();

        await this.room.broadcastImmediate([
            new RpcMessage(
                this.netId,
                new ProtectPlayerMessage(
                    target.characterControl.netId,
                    targetPlayerInfo?.defaultOutfit.color || Color.Red
                )
            )
        ]);
    }
}
