import { HazelReader, HazelWriter } from "@skeldjs/util";
import {
    AllGameOptions,
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
    UsePlatformMessage,
} from "@skeldjs/protocol";

import {
    ChatNoteType,
    SystemType,
    Color,
    Hat,
    Skin,
    Pet,
    SpawnType,
    RpcMessageTag,
    SpawnFlag,
} from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { MovingPlatformSide, MovingPlatformSystem } from "../system";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerDataResolvable, Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";

import { PlayerCompleteTaskEvent, PlayerReportDeadBodyEvent } from "../events";

import {
    PlayerCallMeetingEvent,
    PlayerChatEvent,
    PlayerCheckColorEvent,
    PlayerCheckNameEvent,
    PlayerMurderPlayerEvent,
    PlayerSetColorEvent,
    PlayerSetHatEvent,
    PlayerSetImpostorsEvent,
    PlayerSetNameEvent,
    PlayerSetPetEvent,
    PlayerSetSkinEvent,
    PlayerSetStartCounterEvent,
    PlayerSyncSettingsEvent,
} from "../events";
import { MeetingHud } from "./MeetingHud";
import { PlayerVoteState } from "../misc/PlayerVoteState";

export interface PlayerControlData {
    isNew: boolean;
    playerId: number;
}

export type PlayerControlEvents = NetworkableEvents &
    ExtractEventTypes<
        [
            PlayerCompleteTaskEvent,
            PlayerCheckNameEvent,
            PlayerCheckColorEvent,
            PlayerSetNameEvent,
            PlayerSetColorEvent,
            PlayerSetHatEvent,
            PlayerSetSkinEvent,
            PlayerSetPetEvent,
            PlayerSyncSettingsEvent,
            PlayerSetStartCounterEvent,
            PlayerSetImpostorsEvent,
            PlayerMurderPlayerEvent,
            PlayerReportDeadBodyEvent,
            PlayerCallMeetingEvent,
            PlayerChatEvent
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
> {
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
                await this._handleSetInfected(rpc as SetInfectedMessage);
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
        this._completeTask(rpc.taskidx);

        if (this.player.data?.tasks) {
            await this.emit(
                new PlayerCompleteTaskEvent(
                    this.room,
                    this.player,
                    this.player.data.tasks[rpc.taskidx]
                )
            );
        }
    }

    private _completeTask(taskIdx: number) {
        if (this.room.gamedata) {
            this.room.gamedata.completeTask(this.playerId, taskIdx);
        }
    }

    private _rpcCompleteTask(taskIdx: number) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.CompleteTask,
                new CompleteTaskMessage(taskIdx)
            )
        );
    }

    completeTask(taskIdx: number) {
        this._completeTask(taskIdx);
        this._rpcCompleteTask(taskIdx);
    }

    private async _handleSyncSettings(rpc: SyncSettingsMessage) {
        if (rpc.options) {
            this._syncSettings(rpc.options);

            await this.emit(
                new PlayerSyncSettingsEvent(
                    this.room,
                    this.player,
                    this.room.settings
                )
            );
        }
    }

    private _syncSettings(settings: GameOptions) {
        this.room.settings.patch(settings);
    }

    private _rpcSyncSettings(settings: GameOptions) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SyncSettings,
                new SyncSettingsMessage(settings)
            )
        );
    }

    syncSettings(
        update_settings: Partial<AllGameOptions> | GameOptions = this.room
            .settings
    ) {
        const settings =
            update_settings instanceof GameOptions
                ? update_settings
                : new GameOptions(update_settings);

        this._syncSettings(settings);
        this._rpcSyncSettings(settings);
    }

    private async _handleSetInfected(rpc: SetInfectedMessage) {
        const impostors = rpc.impostors
            .map((id) => this.room.getPlayerByPlayerId(id))
            .filter((player) => player && player.data);

        this._setImpostors(impostors);

        await this.emit(
            new PlayerSetImpostorsEvent(this.room, this.player, impostors)
        );
    }

    private _setImpostors(players: PlayerData[]) {
        for (const impostor of players) {
            impostor.data.impostor = true;
            this.room.gamedata.update(impostor);
        }
    }

    private _rpcSetImpostors(infected: PlayerData[]) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetInfected,
                new SetInfectedMessage(
                    infected.map((player) => player.playerId)
                )
            )
        );
    }

    setImpostors(players: PlayerDataResolvable[]) {
        const resolved = players
            .map((player) => this.room.resolvePlayer(player))
            .filter((player) => player && player.data);

        this._setImpostors(resolved);
        this._rpcSetImpostors(resolved);
    }

    private async _handleCheckName(rpc: CheckNameMessage) {
        if (!this.room.gamedata) {
            return;
        }

        let new_name = rpc.name;

        const players = [...this.room.gamedata.players.values()];
        if (
            players.some(
                (player) =>
                    player.playerId !== this.playerId &&
                    player?.name.toLowerCase() === new_name.toLowerCase()
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
            new PlayerCheckNameEvent(this.room, this.player, rpc.name, new_name)
        );

        if (!ev.canceled) {
            this.setName(ev.altered);

            await this.emit(
                new PlayerSetNameEvent(this.room, this.player, ev.altered)
            );
        }
    }

    private async _rpcCheckName(name: string) {
        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.CheckName,
                    new CheckNameMessage(name)
                ),
            ],
            true,
            this.room.host
        );
    }

    async checkName(name: string) {
        await this._rpcCheckName(name);
    }

    private async _handleCheckColor(rpc: CheckColorMessage) {
        if (!this.room.gamedata) {
            return;
        }

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
                rpc.color,
                new_color
            )
        );

        if (!ev.canceled) {
            this.setColor(ev.altered);

            await this.emit(
                new PlayerSetColorEvent(this.room, this.player, ev.altered)
            );
        }
    }

    private async _rpcCheckColor(color: Color) {
        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.CheckColor,
                    new CheckColorMessage(color)
                ),
            ],
            true,
            this.room.host
        );
    }

    async checkColor(color: Color) {
        await this._rpcCheckColor(color);
    }

    private async _handleSetName(rpc: SetNameMessage) {
        this._setName(rpc.name);

        await this.emit(
            new PlayerSetNameEvent(this.room, this.player, rpc.name)
        );
    }

    private _setName(name: string) {
        this.room.gamedata?.setName(this.playerId, name);
    }

    private _rpcSetName(name: string) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetName,
                new SetNameMessage(name)
            )
        );
    }

    setName(name: string) {
        this._setName(name);
        this._rpcSetName(name);
    }

    private async _handleSetColor(rpc: SetColorMessage) {
        this._setColor(rpc.color);

        await this.emit(
            new PlayerSetColorEvent(this.room, this.player, rpc.color)
        );
    }

    private _setColor(color: Color) {
        this.room.gamedata?.setColor(this.playerId, color);
    }

    private _rpcSetColor(color: Color) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetColor,
                new SetColorMessage(color)
            )
        );
    }

    setColor(color: Color) {
        this._setColor(color);
        this._rpcSetColor(color);
    }

    private async _handleSetHat(rpc: SetHatMessage) {
        this._setHat(rpc.hat);

        await this.emit(new PlayerSetHatEvent(this.room, this.player, rpc.hat));
    }

    private _setHat(hat: Hat) {
        this.room.gamedata?.setHat(this.playerId, hat);
    }

    private _rpcSetHat(hat: Hat) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetHat,
                new SetHatMessage(hat)
            )
        );
    }

    setHat(hat: Hat) {
        this._setHat(hat);
        this._rpcSetHat(hat);
    }

    private async _handleSetSkin(rpc: SetSkinMessage) {
        this._setSkin(rpc.skin);

        await this.emit(
            new PlayerSetSkinEvent(this.room, this.player, rpc.skin)
        );
    }

    private _setSkin(skin: Skin) {
        this.room.gamedata?.setSkin(this.playerId, skin);
    }

    private _rpcSetSkin(skin: Skin) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetSkin,
                new SetSkinMessage(skin)
            )
        );
    }

    setSkin(skin: Skin) {
        this._setSkin(skin);
        this._rpcSetSkin(skin);
    }

    private async _handleReportDeadBody(rpc: ReportDeadBodyMessage) {
        const body =
            rpc.bodyid === 0xff
                ? undefined
                : await this.room.getPlayerByPlayerId(rpc.bodyid);

        const ev = await this.emit(
            new PlayerReportDeadBodyEvent(
                this.room,
                this.player,
                rpc.bodyid === 0xff,
                body
            )
        );

        if (!ev.canceled) {
            this._reportDeadBody(body);

            await this.emit(
                new PlayerCallMeetingEvent(
                    this.room,
                    this.room.host,
                    rpc.bodyid === 0xff,
                    body
                )
            );
        }
    }

    private _reportDeadBody(body?: PlayerData) {
        this.room.host.control.startMeeting(this.player, body);
    }

    private async _rpcReportDeadBody(body?: PlayerData) {
        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.ReportDeadBody,
                    new ReportDeadBodyMessage(body ? body.playerId : 0xff)
                ),
            ],
            true,
            this.room.host
        );
    }

    async reportDeadBody(body?: PlayerData) {
        await this._rpcReportDeadBody(body);
    }

    private async _handleMurderPlayer(rpc: MurderPlayerMessage) {
        const resolved = this.room.getPlayerByNetId(rpc.victimid);

        if (resolved) {
            this._murderPlayer(resolved);

            await this.emit(
                new PlayerMurderPlayerEvent(this.room, this.player, resolved)
            );
        }
    }

    private _murderPlayer(victim: PlayerData) {
        if (victim.data) victim.data.dead = true;
    }

    private _rpcMurderPlayer(victim: PlayerData) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.MurderPlayer,
                new MurderPlayerMessage(victim.control.netid)
            )
        );
    }

    murder(victim: PlayerDataResolvable) {
        const resolved = this.room.resolvePlayer(victim);

        if (resolved?.control) {
            this._murderPlayer(resolved);
            this._rpcMurderPlayer(resolved);
        }
    }

    private async _handleSendChat(rpc: SendChatMessage) {
        await this.emit(
            new PlayerChatEvent(this.room, this.player, rpc.message)
        );
    }

    private _rpcSendChat(message: string) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SendChat,
                new SendChatMessage(message)
            )
        );
    }

    sendChat(message: string) {
        this._rpcSendChat(message);
    }

    private _rpcSendChatNote(player: PlayerData, type: ChatNoteType) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SendChatNote,
                new SendChatNoteMessage(player.playerId, type)
            )
        );
    }

    sendChatNote(player: PlayerDataResolvable, type: ChatNoteType) {
        const _player = this.room.resolvePlayer(player);

        if (_player) {
            this._rpcSendChatNote(_player, type);
        }
    }

    private async _handleStartMeeting(rpc: StartMeetingMessage) {
        const player =
            rpc.bodyid === 0xff
                ? this.room.getPlayerByPlayerId(rpc.bodyid)
                : undefined;

        this._startMeeting(player);

        await this.emit(
            new PlayerCallMeetingEvent(
                this.room,
                this.player,
                rpc.bodyid === 0xff,
                player
            )
        );
    }

    private _startMeeting(caller: PlayerData) {
        const meetinghud = new MeetingHud(
            this.room,
            this.room.getNextNetId(),
            this.room.id,
            {
                states: new Map(
                    [...this.room.players]
                        .filter(([, player]) => player.data && player.spawned)
                        .map(([, player]) => {
                            return [
                                player.playerId,
                                new PlayerVoteState(
                                    this.room,
                                    player.playerId,
                                    null,
                                    player === caller,
                                    false,
                                    player.data.dead
                                ),
                            ];
                        })
                ),
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

    private _rpcStartMeeting(player?: PlayerData) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.StartMeeting,
                new StartMeetingMessage(player ? player.playerId : 0xff)
            )
        );
    }

    startMeeting(caller: PlayerData, body: PlayerDataResolvable | "emergency") {
        const resolved =
            body === "emergency" ? undefined : this.room.resolvePlayer(body);

        this._rpcStartMeeting(resolved);
        this._startMeeting(caller);
    }

    private async _handleSetPet(rpc: SetPetMessage) {
        this._setPet(rpc.pet);

        await this.emit(new PlayerSetPetEvent(this.room, this.player, rpc.pet));
    }

    private _setPet(pet: Pet) {
        this.room.gamedata?.setPet(this.playerId, pet);
    }

    private _rpcSetPet(pet: Pet) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetPet,
                new SetPetMessage(pet)
            )
        );
    }

    setPet(pet: Pet) {
        this._setPet(pet);
        this._rpcSetPet(pet);
    }

    private async _handleSetStartCounter(rpc: SetStartCounterMessage) {
        // todo: Implement sequence IDs for joining/set start counter
        this._setStartCounter(rpc.counter);

        await this.emit(
            new PlayerSetStartCounterEvent(this.room, this.player, rpc.counter)
        );
    }

    private _setStartCounter(counter: number) {
        this.lastStartCounter++;
        this.room.counter = counter;
    }

    private _rpcSetStartCounter(counter: number) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetStartCounter,
                new SetStartCounterMessage(this.lastStartCounter, counter)
            )
        );
    }

    setStartCounter(counter: number) {
        this._setStartCounter(counter);
        this._rpcSetStartCounter(counter);
    }

    private async _handleUsePlatform(rpc: UsePlatformMessage) {
        void rpc;
        this._usePlatform();
    }

    private _usePlatform() {
        const airship = this.room.shipstatus;

        if (airship.type === SpawnType.Airship) {
            const movingPlatform = airship.systems[
                SystemType.GapRoom
            ] as MovingPlatformSystem;

            if (movingPlatform) {
                movingPlatform.setTarget(
                    this.player,
                    movingPlatform.side === MovingPlatformSide.Left
                        ? MovingPlatformSide.Right
                        : MovingPlatformSide.Left
                );
            }
        }
    }

    private _rpcUsePlatform() {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.UsePlatform,
                new UsePlatformMessage()
            )
        );
    }

    usePlatform() {
        this.usePlatform();
        this._rpcUsePlatform();
    }
}
