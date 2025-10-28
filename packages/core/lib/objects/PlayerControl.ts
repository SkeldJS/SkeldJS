import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import {
    BaseSystemMessage,
    BaseRpcMessage,
    CheckColorMessage,
    CheckMurderMessage,
    CheckNameMessage,
    CheckProtectMessage,
    CompleteTaskMessage,
    ComponentSpawnData,
    GameSettings,
    MurderPlayerMessage,
    PlayerControlDataMessage,
    PlayerControlSpawnDataMessage,
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
    UsePlatformMessage,
    CheckShapeshiftMessage,
    RejectShapeshiftMessage,
    UseZiplineMessage,
    CheckZiplineMessage,
    TriggerSporesMessage,
    CheckSporeTriggerMessage
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
    SpawnFlag,
    MurderReasonFlags
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
    PlayerSetLevelEvent,
    PlayerCheckShapeshiftEvent,
    PlayerCheckZiplineEvent,
    PlayerUseZiplineEvent,
    PlayerCheckSporeTriggerEvent,
    PlayerTriggerSporesEvent,
} from "../events";

import { DataState, NetworkedObject } from "../NetworkedObject";
import { StatefulRoom, SpecialOwnerId } from "../StatefulRoom";
import { Player } from "../Player";

import { LobbyBehaviour } from "./LobbyBehaviour";
import { MeetingHud } from "./MeetingHud";

import { CustomNetworkTransform, PlayerPhysics } from "./component";
import { MovingPlatformSide, MovingPlatformSystem, MushroomMixupSabotageSystem } from "../systems";
import { BaseRole, GuardianAngelRole, ShapeshifterRole, UnknownRole } from "../roles";
import { sequenceIdGreaterThan, SequenceIdType } from "../utils/sequenceIds";
import { CrewmatesByTaskEndGameIntent, ImpostorByKillEndGameIntent } from "../EndGameIntent";

export enum ProtectionRemoveReason {
    Timeout,
    MurderAttempt,
}

export type PlayerControlEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[
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
]>;

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
    guardianProtector: Player<RoomType>|undefined;

    /**
     * The player that this player has shapeshifted as, if any.
     */
    shapeshiftTarget: Player<RoomType>|undefined;

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
        if (this.room.canManageObject(this)) {
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
    }

    getPlayerInfo() {
        return this.room.playerInfo.get(this.playerId);
    }

    async processFixedUpdate(delta: number) {
        if (this.protectedByGuardian) {
            this._protectedByGuardianTime -= delta;
            if (this._protectedByGuardianTime <= 0) {
                this._protectedByGuardianTime = 0;
                await this._removeProtection(ProtectionRemoveReason.Timeout);
            }
        }
    }

    parseData(state: DataState, reader: HazelReader): BaseSystemMessage|undefined {
        switch (state) {
            case DataState.Spawn: return PlayerControlSpawnDataMessage.deserializeFromReader(reader);
            case DataState.Update: return PlayerControlDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(message: BaseSystemMessage) {
        if (message instanceof PlayerControlSpawnDataMessage) {
            this.isNew = message.isNew;
            this.playerId = message.playerId;
        }

        if (message instanceof PlayerControlDataMessage) {
            this.playerId = message.playerId;
        }
    }

    createData(state: DataState): BaseSystemMessage|undefined {
        switch (state) {
            case DataState.Spawn: {
                const spawn = new PlayerControlSpawnDataMessage(this.isNew, this.playerId);
                this.isNew = false;
                return spawn;
            };
            case DataState.Update: return new PlayerControlDataMessage(this.playerId);
        }
        return undefined;
    }

    parseRemoteCall(rpcTag: RpcMessageTag, reader: HazelReader): BaseRpcMessage | undefined {
        switch (rpcTag) {
            case RpcMessageTag.CompleteTask: return CompleteTaskMessage.deserializeFromReader(reader);
            case RpcMessageTag.SyncSettings: return SyncSettingsMessage.deserializeFromReader(reader);
            case RpcMessageTag.CheckName: return CheckNameMessage.deserializeFromReader(reader);
            case RpcMessageTag.CheckColor: return CheckColorMessage.deserializeFromReader(reader);
            case RpcMessageTag.SetName: return SetNameMessage.deserializeFromReader(reader);
            case RpcMessageTag.SetColor: return SetColorMessage.deserializeFromReader(reader);
            case RpcMessageTag.ReportDeadBody: return ReportDeadBodyMessage.deserializeFromReader(reader);
            case RpcMessageTag.MurderPlayer: return MurderPlayerMessage.deserializeFromReader(reader);
            case RpcMessageTag.SendChat: return SendChatMessage.deserializeFromReader(reader);
            case RpcMessageTag.StartMeeting: return StartMeetingMessage.deserializeFromReader(reader);
            case RpcMessageTag.SetStartCounter: return SetStartCounterMessage.deserializeFromReader(reader);
            case RpcMessageTag.UsePlatform: return UsePlatformMessage.deserializeFromReader();
            case RpcMessageTag.SendQuickChat: return SendQuickChatMessage.deserializeFromReader(reader);
            case RpcMessageTag.SetLevel: return SetLevelMessage.deserializeFromReader(reader);
            case RpcMessageTag.SetHat: return SetHatMessage.deserializeFromReader(reader);
            case RpcMessageTag.SetSkin: return SetSkinMessage.deserializeFromReader(reader);
            case RpcMessageTag.SetPet: return SetPetMessage.deserializeFromReader(reader);
            case RpcMessageTag.SetVisor: return SetVisorMessage.deserializeFromReader(reader);
            case RpcMessageTag.SetNameplate: return SetNameplateMessage.deserializeFromReader(reader);
            case RpcMessageTag.SetRole: return SetRoleMessage.deserializeFromReader(reader);
            case RpcMessageTag.ProtectPlayer: return ProtectPlayerMessage.deserializeFromReader(reader);
            case RpcMessageTag.Shapeshift: return ShapeshiftMessage.deserializeFromReader(reader);
            case RpcMessageTag.CheckMurder: return CheckMurderMessage.deserializeFromReader(reader);
            case RpcMessageTag.CheckProtect: return CheckProtectMessage.deserializeFromReader(reader);
            case RpcMessageTag.CheckShapeshift: return CheckShapeshiftMessage.deserializeFromReader(reader);
            case RpcMessageTag.RejectShapeshift: return RejectShapeshiftMessage.deserializeFromReader();
            case RpcMessageTag.CheckZipline: return CheckZiplineMessage.deserializeFromReader(reader);
            case RpcMessageTag.UseZipline: return UseZiplineMessage.deserializeFromReader(reader);
            case RpcMessageTag.CheckSporeTrigger: return CheckSporeTriggerMessage.deserializeFromReader(reader);
            case RpcMessageTag.TriggerSpores: return TriggerSporesMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {
        if (rpc instanceof CompleteTaskMessage) await this._handleCompleteTask(rpc);
        if (rpc instanceof SyncSettingsMessage) await this._handleSyncSettings(rpc);
        if (rpc instanceof CheckNameMessage) await this._handleCheckName(rpc);
        if (rpc instanceof CheckColorMessage) await this._handleCheckColor(rpc);
        if (rpc instanceof SetNameMessage) await this._handleSetName(rpc);
        if (rpc instanceof SetColorMessage) await this._handleSetColor(rpc);
        if (rpc instanceof ReportDeadBodyMessage) await this._handleReportDeadBody(rpc);
        if (rpc instanceof MurderPlayerMessage) await this._handleMurderPlayer(rpc);
        if (rpc instanceof SendChatMessage) await this._handleSendChat(rpc);
        if (rpc instanceof StartMeetingMessage) await this._handleStartMeeting(rpc);
        if (rpc instanceof SetStartCounterMessage) await this._handleSetStartCounter(rpc);
        if (rpc instanceof UsePlatformMessage) await this._handleUsePlatform(rpc);
        if (rpc instanceof SendQuickChatMessage) await this._handleSendQuickChat(rpc);
        if (rpc instanceof SetLevelMessage) await this._handleSetLevel(rpc);
        if (rpc instanceof SetHatMessage) await this._handleSetHat(rpc);
        if (rpc instanceof SetSkinMessage) await this._handleSetSkin(rpc);
        if (rpc instanceof SetPetMessage) await this._handleSetPet(rpc);
        if (rpc instanceof SetVisorMessage) await this._handleSetVisor(rpc);
        if (rpc instanceof SetNameplateMessage) await this._handleSetNameplate(rpc);
        if (rpc instanceof SetRoleMessage) await this._handleSetRole(rpc);
        if (rpc instanceof ProtectPlayerMessage) await this._handleProtectPlayer(rpc);
        if (rpc instanceof ShapeshiftMessage) await this._handleShapeshift(rpc);
        if (rpc instanceof CheckMurderMessage) await this._handleCheckMurder(rpc);
        if (rpc instanceof CheckProtectMessage) await this._handleCheckProtect(rpc);
        if (rpc instanceof CheckShapeshiftMessage) await this._handleCheckShapeshift(rpc);
        if (rpc instanceof RejectShapeshiftMessage) await this._handleRejectShapeshift(rpc);
        if (rpc instanceof CheckZiplineMessage) await this._handleCheckZipline(rpc);
        if (rpc instanceof UseZiplineMessage) await this._handleUseZipline(rpc);
        if (rpc instanceof CheckSporeTriggerMessage) await this._handleCheckSporeTrigger(rpc);
        if (rpc instanceof TriggerSporesMessage) await this._handleTriggerSpores(rpc);
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
        const { totalTasks, completedTasks } = this.room.countTasksRemaining();
        if (completedTasks >= totalTasks) {
            this.room.registerEndGameIntent(new CrewmatesByTaskEndGameIntent(this.player, taskIdx));
        }
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
            await this.setNameWithAuth(ev.alteredName);
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
    async setNameWithAuth(name: string) {
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

    async setNameRequest(name: string) {
        await this._rpcCheckName(name);
    }

    async setName(name: string) {
        if (this.room.canManageObject(this)) {
            await this.setNameWithAuth(name);
        } else {
            await this.setNameRequest(name);
        }
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
            this.setColorWithAuth(ev.alteredColor);
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
     * Emits a {@link PlayerSetColorEvent | `player.setcolor`} event.
     *
     * @param color The color to set this player's name to.
     */
    async setColorWithAuth(color: Color) {
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

    async setColorRequest(color: Color) {
        await this._rpcCheckColor(color);
    }

    async setColor(color: Color) {
        if (this.room.canManageObject(this)) {
            await this.setColorWithAuth(color);
        } else {
            await this.setColorRequest(color);
        }
    }

    private async _handleReportDeadBody(rpc: ReportDeadBodyMessage) {
        const reportedBody = rpc.bodyId === 0xff
            ? "emergency"
            : this.room.getPlayerByPlayerId(rpc.bodyId);

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
            this.startMeetingWithAuth(ev.alteredBody, this.player);
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
    

    private async _handleStartMeeting(rpc: StartMeetingMessage) {
        const reportedBody = rpc.bodyId === 0xff
            ? "emergency"
            : this.room.getPlayerByPlayerId(rpc.bodyId) || "emergency";

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

        const movingPlatform = this.room.shipStatus?.systems.get(SystemType.GapRoom);
        if (movingPlatform instanceof MovingPlatformSystem) {
            // TODO: moving platform api
            movingPlatform.useId++;
            movingPlatform.side = MovingPlatformSide.Left;
            movingPlatform.target = this.player;
            movingPlatform.pushDataUpdate();
        }

        for (const [, player] of this.room.players) {
            const playerPhysics = player.characterControl?.getComponentSafe(1, PlayerPhysics);
            if (playerPhysics && playerPhysics.ventId !== -1) {
                playerPhysics.exitVent(playerPhysics.ventId)
            }
        }

        spawnMeetingHud.pushDataState(DataState.Spawn);
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
    async startMeetingWithAuth(body: Player<RoomType> | "emergency", caller: Player<RoomType>) {
        this._rpcStartMeeting(body);
        await this._startMeeting(caller);

        await this.emit(
            new PlayerStartMeetingEvent(
                this.room,
                this.player,
                undefined,
                caller,
                body
            )
        );
    }

    async startMeetingRequest(body: Player<RoomType> | "emergency") {
        await this._rpcReportDeadBody(body);
    }

    async startMeeting(body: Player<RoomType>) {
        if (this.room.canManageObject(this)) {
            await this.startMeetingWithAuth(body, this.player);
        } else {
            await this.startMeetingRequest(body);
        }
    }

    async causeToDie(reason: string) {
        const playerInfo = this.getPlayerInfo();

        playerInfo?.setDead(true);
        await this.room.gameManager?.onPlayerDeath(this, true);

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

        if (!victim || !victim.characterControl)
            return;

        if (rpc.reasonFlags & MurderReasonFlags.FailedError) return;

        if ((rpc.reasonFlags & MurderReasonFlags.FailedProtected) || (rpc.reasonFlags & MurderReasonFlags.DecisionByHost && victim.characterControl.protectedByGuardian)) {
            await victim.characterControl._removeProtection(ProtectionRemoveReason.MurderAttempt);
            return;
        }

        if ((rpc.reasonFlags & MurderReasonFlags.Succeeded) || (rpc.reasonFlags & MurderReasonFlags.DecisionByHost)) {
            await victim.characterControl.causeToDie("murder");

            await this.emit(
                new PlayerMurderEvent(
                    this.room,
                    this.player,
                    rpc,
                    victim
                )
            );

            this._checkMurderEndGame(victim);
        }
    }

    private _rpcMurderPlayer(victim: Player<RoomType>, reasonFlags: number) {
        if (!victim.characterControl)
            return;

        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new MurderPlayerMessage(victim.characterControl.netId, reasonFlags)
            )
        );
    }

    async murderPlayerWithAuth(victim: Player<RoomType>) {
        const characterControl = victim.characterControl;
        if (!characterControl) return;

        if (characterControl.protectedByGuardian) {
            this._rpcMurderPlayer(victim, MurderReasonFlags.DecisionByHost | MurderReasonFlags.FailedProtected);
            await characterControl._removeProtection(ProtectionRemoveReason.MurderAttempt);
            return;
        }

        await characterControl.causeToDie("murder");

        await this.emit(
            new PlayerMurderEvent(
                this.room,
                this.player,
                undefined,
                victim
            )
        );

        this._rpcMurderPlayer(victim, MurderReasonFlags.DecisionByHost | MurderReasonFlags.Succeeded);
        this._checkMurderEndGame(victim);
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
    async murderPlayerRequest(victim: Player<RoomType>) {
        await this._rpcCheckMurder(victim);
    }

    async murderPlayer(victim: Player<RoomType>) {
        if (!this.room.canManageObject(this)) {
            await this.murderPlayerRequest(victim);
            return;
        }

        await this.murderPlayerWithAuth(victim);
    }

    private _checkMurderEndGame(victim: Player<RoomType>) {
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
            this.room.registerEndGameIntent(new ImpostorByKillEndGameIntent(this.player, victim));
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

    private async _handleSetStartCounter(rpc: SetStartCounterMessage) {
        const oldCounter = this.room.startGameCounter;
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

        this.room.startGameCounter = ev.alteredCounter;

        if (this.room.startGameCounter !== rpc.counter) {
            await this._rpcSetStartCounter(ev.alteredCounter);
        }
    }

    private _setStartCounter(counter: number) {
        this.lastStartCounter++;
        this.room.startGameCounter = counter;
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
                this.room.startGameCounter,
                counter
            )
        );

        if (ev.alteredCounter !== counter) {
            this.room.startGameCounter = ev.alteredCounter;
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
            // TODO: use moving platform API
            movingPlatform.useId++;
            movingPlatform.target = this.player;
            movingPlatform.side = movingPlatform.oppositeSide;
            movingPlatform.pushDataUpdate();
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

    private _addProtection(guardianProtector: Player<RoomType>) {
        this.protectedByGuardian = true;
        this.guardianProtector = guardianProtector;
        this._protectedByGuardianTime = this.room.settings.roleSettings.guardianAngelPotectionDuration;
    }

    private async _removeProtection(reason: ProtectionRemoveReason) {
        if (!this.protectedByGuardian)
            return;

        const oldGuardian = this.guardianProtector;
        this.protectedByGuardian = false;
        this.guardianProtector = undefined;
        const ev = await this.emit(
            new PlayerRemoveProtectionEvent(
                this.room,
                this.player,
                reason,
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
            await ev.alteredPlayer.characterControl?.protectPlayerWithAuth(ev.alteredTarget);
        }
    }

    private async _rpcCheckProtect(target: Player<RoomType>) {
        if (!target.characterControl)
            return;

        const targetPlayerInfo = target.getPlayerInfo();

        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new ProtectPlayerMessage(
                    target.characterControl.netId,
                    targetPlayerInfo?.defaultOutfit.color || Color.Red
                )
            )
        );
    }
    
    async protectPlayerWithAuth(target: Player<RoomType>, angelColor = this.getPlayerInfo()?.defaultOutfit.color || Color.Red) {
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

    async protectPlayerRequest(target: Player<RoomType>) {
        await this._rpcCheckProtect(target);
    }

    async protectPlayer(target: Player<RoomType>) {
        if (this.room.canManageObject(this)) {
            await this.protectPlayerWithAuth(target);
        } else {
            await this.protectPlayerRequest(target);
        }
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

    async shapeshiftWithAuth(target: Player<RoomType>, doAnimation: boolean) {
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

    private _shapeshiftIsValid(target: Player<RoomType>, shouldAnimate: boolean) {
        if (this.room.gameState !== GameState.Started)
            return false;

        const thisPlayerInfo = this.getPlayerInfo();
        const targetPlayerInfo = target.getPlayerInfo();

        if (!thisPlayerInfo || !targetPlayerInfo || thisPlayerInfo.roleType !== ShapeshifterRole || thisPlayerInfo.isDisconnected || targetPlayerInfo.isDead)
            return false;
        
        if (!targetPlayerInfo || !targetPlayerInfo) return false;

        const mushroomMixup = this.room.shipStatus?.systems.get(SystemType.MushroomMixupSabotage);
        if (mushroomMixup instanceof MushroomMixupSabotageSystem) {
            if ((mushroomMixup.isSabotaged() || targetPlayerInfo.currentOutfitType === PlayerOutfitType.MushroomMixup) && shouldAnimate) {
                return false;
            }
        }

        if (this.room.meetingHud !== undefined && shouldAnimate) return false;

        return true;
    }

    private async _handleCheckShapeshift(rpc: CheckShapeshiftMessage) {
        const target = this.room.getPlayerByNetId(rpc.targetNetId);

        if (!target || !this.room.canManageObject(this))
            return;

        const ev = await this.emit(
            new PlayerCheckShapeshiftEvent(
                this.room,
                this.player,
                rpc,
                target,
                this._shapeshiftIsValid(target, rpc.doAnimation)
            )
        );

        if (ev.alteredIsValid) {
            await ev.alteredPlayer.characterControl?.shapeshiftWithAuth(ev.alteredTarget, rpc.doAnimation);
        } else {
            await ev.alteredPlayer.characterControl?.rejectShapeshiftWithAuth();
        }
    }

    private async _rpcCheckShapeshift(target: Player<RoomType>, doAnimation: boolean) {
        if (!target.characterControl)
            return;

        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new ShapeshiftMessage(
                    target.characterControl.netId,
                    doAnimation,
                )
            )
        );
    }

    async shapeshiftRequest(target: Player<RoomType>, doAnimation: boolean) {
        if (!target.characterControl)
            return;

        await this.room.broadcastImmediate([
            new RpcMessage(
                this.netId,
                new CheckShapeshiftMessage(
                    target.characterControl.netId,
                    doAnimation,
                )
            )
        ], undefined, [ this.room.authorityId ]);
    }

    async shapeshift(target: Player<RoomType>, doAnimation: boolean) {
        if (this.room.canManageObject(this)) {
            await this.shapeshiftWithAuth(target, doAnimation);
        } else {
            await this.shapeshiftRequest(target, doAnimation);
        }
    }

    async revertShapeshiftWithAuth(doAnimation: boolean) {
        await this.shapeshiftWithAuth(this.player, doAnimation);
    }

    async revertShapeshiftRequest(doAnimation: boolean) {
        await this.shapeshiftRequest(this.player, doAnimation);
    }

    async revertShapeshift(doAnimation: boolean) {
        if (this.room.canManageObject(this)) {
            await this.revertShapeshiftWithAuth(doAnimation);
        } else {
            await this.revertShapeshiftRequest(doAnimation);
        }
    }

    private async _handleRejectShapeshift(rpc: RejectShapeshiftMessage) {
        // TODO: event: shapeshift rejected
    }

    private async _rpcRejectShapeshift() {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new RejectShapeshiftMessage()
            )
        );
    }

    async rejectShapeshiftWithAuth() {
        // TODO: event: shapeshift rejected
        await this._rpcRejectShapeshift();
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
            await ev.alteredPlayer.characterControl?.murderPlayerWithAuth(ev.alteredVictim);
        } else {
            this._rpcMurderPlayer(victim, MurderReasonFlags.DecisionByHost | MurderReasonFlags.FailedError);
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

    protected _ziplineIsValid(fromTop: boolean): boolean {
        const thisPlayerInfo = this.getPlayerInfo();
        // TODO: check if in moving platform
        if (!thisPlayerInfo || thisPlayerInfo.isDead) {
            return false;
        }
        if (this.room.meetingHud !== undefined) return false;

        // TODO: check distance
        return true;
    }

    private async _handleCheckZipline(rpc: CheckZiplineMessage) {
        const ev = await this.emit(
            new PlayerCheckZiplineEvent(
                this.room,
                this.player,
                rpc,
                rpc.fromTop,
                this._ziplineIsValid(rpc.fromTop)
            )
        );

        if (ev.alteredIsValid) {
            await ev.alteredPlayer.characterControl?.useZiplineWithAuth(ev.alteredFromTop);
        }
    }

    private async _rpcCheckZipline(fromTop: boolean) {
        await this.room.broadcastImmediate([
            new RpcMessage(
                this.netId,
                new CheckZiplineMessage(fromTop,)
            )
        ]);
    }

    private async _handleUseZipline(rpc: UseZiplineMessage) {
        await this.emit(
            new PlayerUseZiplineEvent(this.room, this.player, rpc, rpc.fromTop)
        );
    }

    private async _rpcUseZipline(fromTop: boolean) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new UseZiplineMessage(fromTop)
            )
        );
    }

    async useZiplineWithAuth(fromTop: boolean) {
        await this.emit(
            new PlayerUseZiplineEvent(this.room, this.player, undefined, fromTop)
        );

        await this._rpcUseZipline(fromTop);
    }

    async useZiplineRequest(fromTop: boolean) {
        await this._rpcCheckZipline(fromTop);
    }

    async useZipline(fromTop: boolean) {
        if (this.room.canManageObject(this)) {
            await this.useZiplineWithAuth(fromTop);
        } else {
            await this.useZiplineRequest(fromTop);
        }
    }

    protected _sporeTriggerIsValid(mushroomId: number): boolean {
        const thisPlayerInfo = this.getPlayerInfo();
        // TODO: check if in moving platform
        if (!thisPlayerInfo || thisPlayerInfo.isDead) {
            return false;
        }
        if (this.room.meetingHud !== undefined) return false;

        // TODO: check distance
        return true;
    }

    private async _handleCheckSporeTrigger(rpc: CheckSporeTriggerMessage) {
        const ev = await this.emit(
            new PlayerCheckSporeTriggerEvent(
                this.room,
                this.player,
                rpc,
                rpc.mushroomId,
                this._sporeTriggerIsValid(rpc.mushroomId)
            )
        );

        if (ev.alteredIsValid) {
            await ev.alteredPlayer.characterControl?.triggerSporesWithAuth(ev.alteredMushroomId);
        }
    }

    private async _rpcCheckSporeTrigger(mushroomId: number) {
        await this.room.broadcastImmediate([
            new RpcMessage(
                this.netId,
                new CheckSporeTriggerMessage(mushroomId)
            )
        ]);
    }

    private async _handleTriggerSpores(rpc: TriggerSporesMessage) {
        await this.emit(
            new PlayerTriggerSporesEvent(this.room, this.player, rpc, rpc.mushroomId)
        );
    }

    private async _rpcTriggerSpores(mushroomId: number) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new TriggerSporesMessage(mushroomId)
            )
        );
    }

    async triggerSporesWithAuth(mushroomId: number) {
        await this.emit(
            new PlayerTriggerSporesEvent(this.room, this.player, undefined, mushroomId)
        );

        await this._rpcTriggerSpores(mushroomId);
    }

    async triggerSporesRequest(mushroomId: number) {
        await this._rpcCheckSporeTrigger(mushroomId);
    }

    async triggerSpores(mushroomId: number) {
        if (this.room.canManageObject(this)) {
            await this.triggerSporesWithAuth(mushroomId);
        } else {
            await this.triggerSporesRequest(mushroomId);
        }
    }
}
