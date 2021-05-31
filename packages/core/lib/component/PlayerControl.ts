import { HazelReader, HazelWriter } from "@skeldjs/util";
import {
    BaseRpcMessage,
    CheckColorMessage,
    CheckNameMessage,
    CompleteTaskMessage,
    ComponentSpawnData,
    GameOptions,
    MurderPlayerMessage,
    ReportDeadBodyMessage,
    RpcMessage,
    SendChatMessage,
    SendChatNoteMessage,
    SetColorMessage,
    SetHatMessage,
    SetInfectedMessage,
    SetNameMessage,
    SetPetMessage,
    SetSkinMessage,
    SetStartCounterMessage,
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
    SpawnFlag,
    Pet,
    SystemType
} from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "../Networkable";
import { Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";

import {
    PlayerCheckColorEvent,
    PlayerCheckNameEvent,
    PlayerCompleteTaskEvent,
    PlayerMurderEvent,
    PlayerReportDeadBodyEvent,
    PlayerSendChatEvent,
    PlayerSetColorEvent,
    PlayerSetHatEvent,
    PlayerSetImpostorsEvent,
    PlayerSetNameEvent,
    PlayerSetPetEvent,
    PlayerSetSkinEvent,
    PlayerSetStartCounterEvent,
    PlayerStartMeetingEvent,
    PlayerSyncSettingsEvent
} from "../events";
import { MeetingHud } from "./MeetingHud";
import { PlayerVoteState } from "../misc/PlayerVoteState";
import { MovingPlatformSide, MovingPlatformSystem } from "../system/MovingPlatformSystem";

export interface PlayerControlData {
    isNew: boolean;
    playerId: number;
}

export type PlayerControlEvents = NetworkableEvents &
    ExtractEventTypes<
        [
            PlayerCheckColorEvent,
            PlayerCheckNameEvent,
            PlayerMurderEvent,
            PlayerReportDeadBodyEvent,
            PlayerSendChatEvent,
            PlayerSetColorEvent,
            PlayerSetHatEvent,
            PlayerSetImpostorsEvent,
            PlayerSetNameEvent,
            PlayerSetPetEvent,
            PlayerSetSkinEvent,
            PlayerSetStartCounterEvent,
            PlayerStartMeetingEvent,
            PlayerSyncSettingsEvent
        ]
    >;

/**
 * Represents a player object for interacting with the game and other players.
 *
 * See {@link PlayerControlEvents} for events to listen to.
 */
export class PlayerControl extends Networkable<
    PlayerControlData,
    PlayerControlEvents
> implements PlayerControlData {
    static type = SpawnType.Player as const;
    type = SpawnType.Player as const;

    static classname = "PlayerControl" as const;
    classname = "PlayerControl" as const;

    private lastStartCounter = 0;

    /**
     * Whether the player was just spawned, or was spawned before joining.
     */
    isNew: boolean;

    /**
     * The player ID of the player.
     */
    playerId: number;

    constructor(
        room: Hostable<any>,
        netid: number,
        ownerid: number,
        data?: HazelReader | PlayerControlData
    ) {
        super(room, netid, ownerid, data);

        this.isNew ??= true;
        this.playerId ||= 0;
    }

    get player() {
        return this.owner as PlayerData;
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
        switch (rpc.tag) {
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
                if (this.room.amhost) {
                    await this._handleCheckName(rpc as CheckNameMessage);
                }
                break;
            case RpcMessageTag.CheckColor:
                if (this.room.amhost) {
                    await this._handleCheckColor(rpc as CheckColorMessage);
                }
                break;
            case RpcMessageTag.SetName:
                await this._handleSetName(rpc as SetNameMessage);
                break;
            case RpcMessageTag.SetColor:
                await this._handleSetColor(rpc as SetColorMessage);
                break;
            case RpcMessageTag.SetHat:
                await this._handleSetHat(rpc as SetHatMessage);
                break;
            case RpcMessageTag.SetSkin:
                await this._handleSetSkin(rpc as SetSkinMessage);
                break;
            case RpcMessageTag.ReportDeadBody:
                if (this.room.amhost) {
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
            case RpcMessageTag.SetPet:
                await this._handleSetPet(rpc as SetPetMessage);
                break;
            case RpcMessageTag.SetStartCounter:
                await this._handleSetStartCounter(
                    rpc as SetStartCounterMessage
                );
                break;
            case RpcMessageTag.UsePlatform:
                await this._handleUsePlatform(rpc as UsePlatformMessage);
                break;
        }
    }

    private async _handleCompleteTask(rpc: CompleteTaskMessage) {
        if (!this.player.info?.taskStates)
            return;

        this._completeTask(rpc.taskidx);

        await this.emit(
            new PlayerCompleteTaskEvent(
                this.room,
                this.player,
                rpc,
                this.player.info.taskStates[rpc.taskidx]
            )
        );
    }

    private _completeTask(taskIdx: number) {
        this.room.gamedata?.completeTask(this.playerId, taskIdx);
    }

    private async _rpcCompleteTask(taskIdx: number) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
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
        if (!this.player.info?.taskStates[taskIdx])
            return;

        this.emit(
            new PlayerCompleteTaskEvent(
                this.room,
                this.player,
                undefined,
                this.player.info.taskStates[taskIdx]
            )
        );

        this._completeTask(taskIdx);
        this._rpcCompleteTask(taskIdx);
    }

    private async _handleSyncSettings(rpc: SyncSettingsMessage) {
        if (!rpc.options)
            return;

        this._syncSettings(rpc.options);

        const ev = await this.emit(
            new PlayerSyncSettingsEvent(
                this.room,
                this.player,
                rpc,
                rpc.options
            )
        );

        if (ev.isDirty) {
            this._syncSettings(ev.alteredSettings);
            this._rpcSyncSettings(ev.alteredSettings);
        }
    }

    private _syncSettings(settings: GameOptions) {
        this.room.settings.patch(settings);
    }

    private async _rpcSyncSettings(settings: GameOptions) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
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
     * @property settings The full game options object to update the settings to.
     */
    async syncSettings(settings: GameOptions) {
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

        this._syncSettings(settings);
        this._rpcSyncSettings(settings);
    }

    private async _handleSetImpostors(rpc: SetInfectedMessage) {
        const impostors = rpc.impostors
            .map((id) => this.room.getPlayerByPlayerId(id))
            .filter((player) => player && player.info) as PlayerData[];

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
            if (!player.info)
                continue;

            if (impostors.includes(player)) {
                player.info.setImpostor(true);
            } else {
                if (player.info.isImpostor) {
                    player.info.setImpostor(false);
                }
            }
        }
    }

    private _rpcSetImpostors(impostors: PlayerData[]) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
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

        if (ev.isDirty) this._setImpostors(ev.alteredImpostors);

        this._rpcSetImpostors(impostors);
    }

    private async _handleCheckName(rpc: CheckNameMessage) {
        if (!this.room.gamedata)
            return;

        let new_name = rpc.name;

        const players = [...this.room.gamedata.players.values()];
        if (
            players.some(
                (player) =>
                    player.playerId !== this.playerId &&
                    player.name.toLowerCase() === new_name.toLowerCase()
            )
        ) {
            for (let i = 1; i < 100; i++) {
                new_name = rpc.name + " " + i;

                if (
                    !players.some(
                        (player) =>
                            player.playerId !== this.playerId &&
                            player.name.toLowerCase() === new_name.toLowerCase()
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
                new_name
            )
        );

        if (!ev.canceled) {
            await this.setName(ev.alteredName);
        }
    }

    private async _rpcCheckName(name: string) {
        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    new CheckNameMessage(name)
                ),
            ],
            true,
            this.room.host
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
        const playerInfo = this.room.gamedata?.players.get(this.playerId);
        if (!playerInfo)
            return;

        const oldName = playerInfo.name;
        playerInfo.name = rpc.name;

        const ev = await this.emit(
            new PlayerSetNameEvent(
                this.room,
                this.player,
                rpc,
                oldName,
                rpc.name
            )
        );

        playerInfo.name = ev.alteredName;

        if (ev.alteredName !== rpc.name) {
            this._rpcSetName(ev.alteredName);
        }
    }

    private _rpcSetName(name: string) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
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
        const playerInfo = this.room.gamedata?.players.get(this.playerId);
        if (!playerInfo)
            return;

        const oldName = playerInfo.name;
        playerInfo.name = name;

        const ev = await this.emit(
            new PlayerSetNameEvent(
                this.room,
                this.player,
                undefined,
                oldName,
                name
            )
        );

        playerInfo.name = ev.alteredName;

        if (playerInfo.name !== oldName) {
            this._rpcSetName(playerInfo.name);
        }
    }

    private async _handleCheckColor(rpc: CheckColorMessage) {
        if (!this.room.gamedata)
            return;

        let new_color = rpc.color;

        const players = [...this.room.gamedata.players.values()];
        while (
            players.some(
                (player) =>
                    player.playerId !== this.playerId &&
                    player.color === rpc.color
            )
        ) {
            new_color++;
            if (new_color > 11) {
                new_color = 0;
            }
        }

        const ev = await this.emit(
            new PlayerCheckColorEvent(
                this.room,
                this.player,
                rpc,
                rpc.color,
                new_color
            )
        );

        if (!ev.canceled) {
            this.setColor(ev.alteredColor);
        }
    }

    private async _rpcCheckColor(color: Color) {
        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    new CheckColorMessage(color)
                ),
            ],
            true,
            this.room.host
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
        const playerInfo = this.room.gamedata?.players.get(this.playerId);
        if (!playerInfo)
            return;

        const oldColor = playerInfo.color;
        playerInfo.color = rpc.color;

        const ev = await this.emit(
            new PlayerSetColorEvent(
                this.room,
                this.player,
                rpc,
                oldColor,
                rpc.color
            )
        );

        playerInfo.color = ev.alteredColor;

        if (ev.alteredColor !== rpc.color) {
            this._rpcSetColor(ev.alteredColor);
        }
    }

    private _rpcSetColor(color: Color) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
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
        const playerInfo = this.room.gamedata?.players.get(this.playerId);
        if (!playerInfo)
            return;

        const oldColor = playerInfo.color;
        playerInfo.color = color;

        const ev = await this.emit(
            new PlayerSetColorEvent(
                this.room,
                this.player,
                undefined,
                oldColor,
                color
            )
        );

        playerInfo.color = ev.alteredColor;

        if (playerInfo.color !== oldColor) {
            this._rpcSetColor(playerInfo.color);
        }
    }

    private async _handleSetHat(rpc: SetHatMessage) {
        const playerInfo = this.room.gamedata?.players.get(this.playerId);
        if (!playerInfo)
            return;

        const oldHat = playerInfo.hat;
        playerInfo.hat = rpc.hat;

        const ev = await this.emit(
            new PlayerSetHatEvent(
                this.room,
                this.player,
                rpc,
                oldHat,
                rpc.hat
            )
        );

        playerInfo.hat = ev.alteredHat;

        if (ev.alteredHat !== rpc.hat) {
            this._rpcSetHat(ev.alteredHat);
        }
    }

    private _rpcSetHat(hat: Hat) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                new SetHatMessage(hat)
            )
        );
    }

    /**
     * Update this player's hat. This is not a host operation unless the
     * client does not own this player.
     *
     * Emits a {@link PlayerSetHatEvent | `player.sethat`} event.
     *
     * @param hat The hat to set this player's hat to.
     */
    async setHat(hat: Hat) {
        const playerInfo = this.room.gamedata?.players.get(this.playerId);
        if (!playerInfo)
            return;

        const oldHat = playerInfo.hat;
        playerInfo.hat = hat;

        const ev = await this.emit(
            new PlayerSetHatEvent(
                this.room,
                this.player,
                undefined,
                oldHat,
                hat
            )
        );

        playerInfo.hat = ev.alteredHat;

        if (playerInfo.hat !== oldHat) {
            this._rpcSetHat(playerInfo.hat);
        }
    }

    private async _handleSetSkin(rpc: SetSkinMessage) {
        const playerInfo = this.room.gamedata?.players.get(this.playerId);
        if (!playerInfo)
            return;

        const oldSkin = playerInfo.skin;
        playerInfo.skin = rpc.skin;

        const ev = await this.emit(
            new PlayerSetSkinEvent(
                this.room,
                this.player,
                rpc,
                oldSkin,
                rpc.skin
            )
        );

        playerInfo.skin = ev.alteredSkin;

        if (ev.alteredSkin !== rpc.skin) {
            this._rpcSetSkin(ev.alteredSkin);
        }
    }

    private _rpcSetSkin(skin: Skin) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                new SetSkinMessage(skin)
            )
        );
    }

    /**
     * Update this player's skin. This is not a host operation unless the
     * client does not own this player.
     *
     * Emits a {@link PlayerSetSkinEvent | `player.setskin`} event.
     *
     * @param skin The skin to set this player's skin to.
     */
    async setSkin(skin: Skin) {
        const playerInfo = this.room.gamedata?.players.get(this.playerId);
        if (!playerInfo)
            return;

        const oldSkin = playerInfo.skin;
        playerInfo.skin = skin;

        const ev = await this.emit(
            new PlayerSetSkinEvent(
                this.room,
                this.player,
                undefined,
                oldSkin,
                skin
            )
        );

        playerInfo.skin = ev.alteredSkin;

        if (playerInfo.skin !== oldSkin) {
            this._rpcSetSkin(playerInfo.skin);
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
            this.room?.host?.control?.startMeeting(this.player, ev.alteredBody);
        }
    }

    private async _rpcReportDeadBody(body: PlayerData | "emergency"): Promise<void> {
        if (body !== "emergency" && body.playerId === undefined) {
            return this._rpcReportDeadBody("emergency");
        }

        await this.room.broadcast([
            new RpcMessage(
                this.netid,
                new ReportDeadBodyMessage(
                    body === "emergency"
                        ? 0xff
                        : body.playerId!
                )
            )
        ], true, this.room.host);
    }

    /**
     * Report the dead body of a player, telling the host to begin a meeting.
     * Use {@link PlayerControl.startMeeting} if you are calling this as the
     * host.
     *
     * Emits a {@link PlayerReportDeadBodyEvent `player.reportbody`} event.
     */
    async reportDeadBody(body: PlayerData | "emergency") {
        const ev = await this.emit(
            new PlayerReportDeadBodyEvent(
                this.room,
                this.player,
                undefined,
                body
            )
        );

        if (!ev.canceled) {
            await this._rpcReportDeadBody(ev.alteredBody);
        }
    }

    private async _handleMurderPlayer(rpc: MurderPlayerMessage) {
        const victim = this.room.getPlayerByNetId(rpc.victimid);

        if (!victim || victim.playerId === undefined)
            return;

        if (victim.info) {
            victim.info.setDead(true);
            this.room.gamedata?.update(victim.playerId);
        }

        await this.emit(
            new PlayerMurderEvent(
                this.room,
                this.player,
                rpc,
                victim
            )
        );
    }

    private _rpcMurderPlayer(victim: PlayerData) {
        if (!victim.control)
            return;

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                new MurderPlayerMessage(victim.control.netid)
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
    murderPlayer(victim: PlayerData) {
        if (victim.playerId === undefined)
            return;

        if (victim.info) {
            victim.info.setDead(true);
            this.room.gamedata?.update(victim.playerId);
        }

        this.emit(
            new PlayerMurderEvent(
                this.room,
                this.player,
                undefined,
                victim
            )
        );

        this._rpcMurderPlayer(victim);
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
                this.netid,
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
                this.netid,
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
            : this.room.getPlayerByPlayerId(rpc.bodyid);

        if (!reportedBody)
            return;

        await this.emit(
            new PlayerStartMeetingEvent(
                this.room,
                this.player,
                rpc,
                reportedBody
            )
        );

        this._startMeeting(this.player);
    }

    private _startMeeting(caller: PlayerData) {
        const meetinghud = new MeetingHud(
            this.room,
            this.room.getNextNetId(),
            this.room.id,
            {
                states: new Map(
                    [...this.room.players]
                        .filter(([, player]) => player.info && player.spawned && player.playerId !== undefined)
                        .map(([, player]) => {
                            return [
                                player.playerId,
                                new PlayerVoteState(
                                    this.room,
                                    player.playerId!,
                                    undefined,
                                    player === caller,
                                    false,
                                    player.info?.isDead
                                ),
                            ];
                        })
                ) as Map<number, PlayerVoteState>,
            }
        );

        this.room.spawnComponent(meetinghud);

        const writer = HazelWriter.alloc(0);
        writer.write(meetinghud, true);

        this.room.stream.push(
            new SpawnMessage(SpawnType.MeetingHud, -2, SpawnFlag.None, [
                new ComponentSpawnData(meetinghud.netid, writer.buffer),
            ])
        );
    }

    private _rpcStartMeeting(player: PlayerData|"emergency"): void {
        if (player !== "emergency" && player.playerId === undefined) {
            return this._rpcStartMeeting("emergency");
        }

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                new StartMeetingMessage(
                    player === "emergency"
                        ? 0xff
                        : player.playerId!
                )
            )
        );
    }

    /**
     * Start a meeting and begin the meeting routine. This is a host-only operation
     * on official servers, see {@link PlayerControl.reportDeadBody} if you are calling
     * this as not the host.
     *
     * Emits a {@link PlayerStartMeetingEvent | `player.startmeeting`} event.
     *
     * @param caller The player that called this meeting.
     * @param body The body that was reported, or "emergency" if it is an emergency meeting.
     */
    startMeeting(caller: PlayerData, body: PlayerData | "emergency") {
        this.emit(
            new PlayerStartMeetingEvent(
                this.room,
                this.player,
                undefined,
                body
            )
        );

        this._rpcStartMeeting(body);
        this._startMeeting(caller);
    }

    private async _handleSetPet(rpc: SetPetMessage) {
        const playerInfo = this.room.gamedata?.players.get(this.playerId);
        if (!playerInfo)
            return;

        const oldPet = playerInfo.pet;
        playerInfo.pet = rpc.pet;

        const ev = await this.emit(
            new PlayerSetPetEvent(
                this.room,
                this.player,
                rpc,
                oldPet,
                rpc.pet
            )
        );

        playerInfo.pet = ev.alteredPet;

        if (ev.alteredPet !== rpc.pet) {
            this._rpcSetPet(ev.alteredPet);
        }
    }

    private _rpcSetPet(pet: Pet) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                new SetPetMessage(pet)
            )
        );
    }

    /**
     * Update this player's pet. This is not a host operation unless the
     * client does not own this player.
     *
     * Emits a {@link PlayerSetPetEvent | `player.setpet`} event.
     *
     * @param pet The pet to set this player's pet to.
     */
    async setPet(pet: Pet) {
        const playerInfo = this.room.gamedata?.players.get(this.playerId);
        if (!playerInfo)
            return;

        const oldPet = playerInfo.pet;
        playerInfo.pet = pet;

        const ev = await this.emit(
            new PlayerSetPetEvent(
                this.room,
                this.player,
                undefined,
                oldPet,
                pet
            )
        );

        playerInfo.pet = ev.alteredPet;

        if (playerInfo.pet !== oldPet) {
            this._rpcSetPet(playerInfo.pet);
        }
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
                this.netid,
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
        void rpc;
        this._usePlatform();
    }

    private _usePlatform() {
        const airship = this.room.shipstatus;

        if (!airship || airship.type !== SpawnType.Airship)
            return;

        const movingPlatform = airship.systems[SystemType.GapRoom] as MovingPlatformSystem;

        if (movingPlatform) {
            movingPlatform.setTarget(
                this.player,
                movingPlatform.side === MovingPlatformSide.Left
                    ? MovingPlatformSide.Right
                    : MovingPlatformSide.Left
            );
        }
    }

    /**
     * Use the moving platfrom on the map, i.e. the one on Airship.
     *
     * Emits a {@link MovingPlatformPlayerUpdateEvent | `movingplatform.playerupdate`} event.
     */
    usePlatform() {
        this._usePlatform();
    }
}
