import { HazelReader, HazelWriter } from "@skeldjs/util";
import { AllGameOptions, ComponentSpawnData, GameOptions, RpcMessage, SpawnMessage } from "@skeldjs/protocol";

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

export type PlayerControlEvents =
    NetworkableEvents &
ExtractEventTypes<[
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
]>;

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

    async HandleRpc(callid: RpcMessageTag, reader: HazelReader) {
        switch (callid) {
            case RpcMessageTag.CompleteTask:
                await this._handleCompleteTask(reader);
                break;
            case RpcMessageTag.SyncSettings:
                await this._handleSyncSettings(reader);
                break;
            case RpcMessageTag.SetInfected:
                await this._handleSetInfected(reader);
                break;
            case RpcMessageTag.CheckName:
                if (this.room.amhost) {
                    await this._handleCheckName(reader);
                }
                break;
            case RpcMessageTag.CheckColor:
                if (this.room.amhost) {
                    await this._handleCheckColor(reader);
                }
                break;
            case RpcMessageTag.SetName:
                await this._handleSetName(reader);
                break;
            case RpcMessageTag.SetColor:
                await this._handleSetColor(reader);
                break;
            case RpcMessageTag.SetHat:
                await this._handleSetHat(reader);
                break;
            case RpcMessageTag.SetSkin:
                await this._handleSetSkin(reader);
                break;
            case RpcMessageTag.ReportDeadBody:
                if (this.room.amhost) {
                    await this._handleReportDeadBody(reader);
                }
                break;
            case RpcMessageTag.MurderPlayer:
                await this._handleMurderPlayer(reader);
                break;
            case RpcMessageTag.SendChat:
                await this._handleSendChat(reader);
                break;
            case RpcMessageTag.StartMeeting:
                await this._handleStartMeeting(reader);
                break;
            case RpcMessageTag.SetPet:
                await this._handleSetPet(reader);
                break;
            case RpcMessageTag.SetStartCounter:
                await this._handleSetStartCounter(reader);
                break;
            case RpcMessageTag.UsePlatform:
                await this._handleUsePlatform(reader);
                break;
        }
    }

    private async _handleCompleteTask(reader: HazelReader) {
        const taskIdx = reader.upacked();

        this._completeTask(taskIdx);

        if (this.player.data?.tasks) {
            await this.emit(
                new PlayerCompleteTaskEvent(
                    this.room,
                    this.player,
                    this.player.data.tasks[taskIdx]
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
        const writer = HazelWriter.alloc(1);
        writer.upacked(taskIdx);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.CompleteTask,
                writer.buffer
            )
        );
    }

    completeTask(taskIdx: number) {
        this._completeTask(taskIdx);
        this._rpcCompleteTask(taskIdx);
    }

    private async _handleSyncSettings(reader: HazelReader) {
        const settings = reader.read(GameOptions);

        if (settings) {
            this._syncSettings(settings);

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
        const writer = HazelWriter.alloc(40);
        writer.write(settings);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SyncSettings,
                writer.buffer
            )
        );
    }

    syncSettings(
        update_settings: Partial<AllGameOptions> | GameOptions = this.room.settings
    ) {
        const settings = update_settings instanceof GameOptions
            ? update_settings
            : new GameOptions(update_settings);

        this._syncSettings(settings);
        this._rpcSyncSettings(settings);
    }

    private async _handleSetInfected(reader: HazelReader) {
        const impostors = reader
            .list((r) => r.uint8())
            .map(id => this.room.getPlayerByPlayerId(id))
            .filter(player => player && player.data);

        this._setInfected(impostors);

        await this.emit(
            new PlayerSetImpostorsEvent(
                this.room,
                this.player,
                impostors
            )
        );
    }

    private _setInfected(players: PlayerData[]) {
        for (const impostor of players) {
            impostor.data.impostor = true;
        }
    }

    private _rpcSetInfected(players: PlayerData[]) {
        const writer = HazelWriter.alloc(players.length + 1);
        writer.list(true, players, (player) => writer.uint8(player.playerId));

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetInfected,
                writer.buffer
            )
        );
    }

    setInfected(players: PlayerDataResolvable[]) {
        const resolved = players
            .map((player) => this.room.resolvePlayer(player))
            .filter((player) => player && player.data);

        this._setInfected(resolved);
        this._rpcSetInfected(resolved);
    }

    private async _handleCheckName(reader: HazelReader) {
        const name = reader.string();
        if (!this.room.gamedata) {
            return;
        }

        let new_name = name;

        const players = [...this.room.gamedata.players.values()];
        if (
            players.some(
                (player) =>
                    player.playerId !== this.playerId &&
                    player?.name.toLowerCase() === new_name.toLowerCase()
            )
        ) {
            for (let i = 1; i < 100; i++) {
                new_name = name + " " + i;

                if (
                    !players.some(
                        (player) =>
                            player.playerId !== this.playerId &&
                            player.name.toLowerCase() ===
                                new_name.toLowerCase()
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
                name,
                new_name
            )
        );

        this.setName(ev.altered);
    }

    private async _rpcCheckName(name: string) {
        const writer = HazelWriter.alloc(name.length + 1);
        writer.string(name);

        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.CheckName,
                    writer.buffer
                ),
            ],
            true,
            this.room.host
        );
    }

    async checkName(name: string) {
        await this._rpcCheckName(name);
    }

    private async _handleCheckColor(reader: HazelReader) {
        const color = reader.uint8();
        if (!this.room.gamedata) {
            return;
        }

        let new_color = color;

        const players = [...this.room.gamedata.players.values()];
        while (
            players.some(
                (player) =>
                    player.playerId !== this.playerId &&
                    player.color === color
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
                color,
                new_color
            )
        );

        this.setColor(ev.altered);
    }

    private async _rpcCheckColor(color: Color) {
        const writer = HazelWriter.alloc(1);
        writer.uint8(color);

        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.CheckColor,
                    writer.buffer
                ),
            ],
            true,
            this.room.host
        );
    }

    async checkColor(color: Color) {
        await this._rpcCheckColor(color);
    }

    private async _handleSetName(reader: HazelReader) {
        const name = reader.string();
        this._setName(name);

        await this.emit(
            new PlayerSetNameEvent(
                this.room,
                this.player,
                name
            )
        );
    }

    private _setName(name: string) {
        this.room.gamedata?.setName(this.playerId, name);
    }

    private _rpcSetName(name: string) {
        const writer = HazelWriter.alloc(name.length + 1);
        writer.string(name);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetName,
                writer.buffer
            )
        );
    }

    setName(name: string) {
        this._setName(name);
        this._rpcSetName(name);
    }

    private async _handleSetColor(reader: HazelReader) {
        const color = reader.uint8();
        this._setColor(color);

        await this.emit(
            new PlayerSetColorEvent(
                this.room,
                this.player,
                color
            )
        );
    }

    private _setColor(color: Color) {
        this.room.gamedata?.setColor(this.playerId, color);
    }

    private _rpcSetColor(color: Color) {
        const writer = HazelWriter.alloc(1);
        writer.uint8(color);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetColor,
                writer.buffer
            )
        );
    }

    setColor(color: Color) {
        this._setColor(color);
        this._rpcSetColor(color);
    }

    private async _handleSetHat(reader: HazelReader) {
        const hat = reader.upacked();
        this._setHat(hat);

        await this.emit(
            new PlayerSetHatEvent(
                this.room,
                this.player,
                hat
            )
        );
    }

    private _setHat(hat: Hat) {
        this.room.gamedata?.setHat(this.playerId, hat);
    }

    private _rpcSetHat(hat: Hat) {
        const writer = HazelWriter.alloc(1);
        writer.upacked(hat);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetHat,
                writer.buffer
            )
        );
    }

    setHat(hat: Hat) {
        this._setHat(hat);
        this._rpcSetHat(hat);
    }

    private async _handleSetSkin(reader: HazelReader) {
        const skin = reader.upacked();
        this._setSkin(skin);

        await this.emit(
            new PlayerSetSkinEvent(
                this.room,
                this.player,
                skin
            )
        );
    }

    private _setSkin(skin: Skin) {
        this.room.gamedata?.setSkin(this.playerId, skin);
    }

    private _rpcSetSkin(skin: Skin) {
        const writer = HazelWriter.alloc(1);
        writer.upacked(skin);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetSkin,
                writer.buffer
            )
        );
    }

    setSkin(skin: Skin) {
        this._setSkin(skin);
        this._rpcSetSkin(skin);
    }

    private async _handleReportDeadBody(reader: HazelReader) {
        const bodyid = reader.uint8();

        const body = bodyid === 0xff
            ? undefined
            : await this.room.getPlayerByPlayerId(bodyid);

        const ev = await this.emit(
            new PlayerReportDeadBodyEvent(
                this.room,
                this.player,
                bodyid === 0xff,
                body
            )
        );

        if (!ev.canceled) {
            this._reportDeadBody(body);
        }
    }

    private _reportDeadBody(body?: PlayerData) {
        this.room.host.control.startMeeting(body);
    }

    private async _rpcReportDeadBody(body?: PlayerData) {
        const writer = HazelWriter.alloc(1);
        writer.uint8(body ? body.playerId : 0xff);

        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.ReportDeadBody,
                    writer.buffer
                )
            ],
            true,
            this.room.host
        );
    }

    async reportDeadBody(body?: PlayerData) {
        await this._rpcReportDeadBody(body);
    }

    private async _handleMurderPlayer(reader: HazelReader) {
        const netid = reader.upacked();

        const resolved = this.room.getPlayerByNetId(netid);

        if (resolved) {
            this._murderPlayer(resolved);

            await this.emit(
                new PlayerMurderPlayerEvent(
                    this.room,
                    this.player,
                    resolved
                )
            );
        }
    }

    private _murderPlayer(victim: PlayerData) {
        if (victim.data)
            victim.data.dead = true;
    }

    private _rpcMurderPlayer(victim: PlayerData) {
        const writer = HazelWriter.alloc(1);
        writer.upacked(victim.control.netid);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.MurderPlayer,
                writer.buffer
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

    private async _handleSendChat(reader: HazelReader) {
        const message = reader.string();

        await this.emit(
            new PlayerChatEvent(
                this.room,
                this.player,
                message
            )
        );
    }

    private _rpcSendChat(message: string) {
        const writer = HazelWriter.alloc(1);
        writer.string(message);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SendChat,
                writer.buffer
            )
        );
    }

    sendChat(message: string) {
        this._rpcSendChat(message);
    }

    private _rpcSendChatNote(type: ChatNoteType) {
        const writer = HazelWriter.alloc(2);
        writer.uint8(this.playerId);
        writer.uint8(type);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SendChatNote,
                writer.buffer
            )
        );
    }

    sendChatNote(type: ChatNoteType) {
        this._rpcSendChatNote(type);
    }

    private async _handleStartMeeting(reader: HazelReader) {
        const bodyid = reader.uint8();

        const player = bodyid === 0xff
            ? this.room.getPlayerByPlayerId(bodyid)
            : undefined;

        this._startMeeting(player);

        await this.emit(
            new PlayerCallMeetingEvent(
                this.room,
                this.player,
                bodyid === 0xff,
                player
            )
        );
    }

    private _startMeeting(player?: PlayerData) {
        void player;

        const meetinghud = new MeetingHud(
            this.room,
            this.room.incr_netid,
            this.room.id,
            {
                states: new Map(
                    [...this.room.players]
                        .filter(([ , player ]) => player.data && player.spawned)
                        .map(([ , player ]) => {
                            return [
                                player.playerId,
                                new PlayerVoteState(
                                    this.room,
                                    player.playerId,
                                    null,
                                    player === this.player,
                                    false,
                                    player.data.dead
                                )
                            ];
                        })
                )
            }
        );

        const writer = HazelWriter.alloc(0);
        writer.write(meetinghud, true);

        this.room.stream.push(
            new SpawnMessage(
                SpawnType.MeetingHud,
                -2,
                SpawnFlag.None,
                [
                    new ComponentSpawnData(
                        meetinghud.netid,
                        writer.buffer
                    )
                ]
            )
        );
    }

    private async _rpcStartMeeting(player?: PlayerData) {
        const writer = HazelWriter.alloc(1);
        writer.uint8(player ? player.playerId : 0xff);

        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.StartMeeting,
                    writer.buffer
                )
            ]
        );
    }

    async startMeeting(body: PlayerDataResolvable | "emergency") {
        const resolved = body === "emergency"
            ? undefined
            : this.room.resolvePlayer(body);

        await this._rpcStartMeeting(resolved);
        this._startMeeting(resolved);
    }

    private async _handleSetPet(reader: HazelReader) {
        const pet = reader.upacked();
        this._setPet(pet);

        await this.emit(
            new PlayerSetPetEvent(
                this.room,
                this.player,
                pet
            )
        );
    }

    private _setPet(pet: Pet) {
        this.room.gamedata?.setPet(this.playerId, pet);
    }

    private _rpcSetPet(pet: Pet) {
        const writer = HazelWriter.alloc(1);
        writer.upacked(pet);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetPet,
                writer.buffer
            )
        );
    }

    setPet(pet: Pet) {
        this._setPet(pet);
        this._rpcSetPet(pet);
    }

    private async _handleSetStartCounter(reader: HazelReader) {
        /*TODO: Implement sequence IDs for joining/set start counter
        const seq = */ reader.upacked();
        const counter = reader.uint8();
        this._setStartCounter(counter);

        await this.emit(
            new PlayerSetStartCounterEvent(
                this.room,
                this.player,
                counter
            )
        );
    }

    private _setStartCounter(counter: number) {
        this.lastStartCounter++;
        this.room.counter = counter;
    }

    private _rpcSetStartCounter(counter: number) {
        const writer = HazelWriter.alloc(2);
        writer.upacked(this.lastStartCounter);
        writer.uint8(counter);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetStartCounter,
                writer.buffer
            )
        );
    }

    setStartCounter(counter: number) {
        this._setStartCounter(counter);
        this._rpcSetStartCounter(counter);
    }

    private async _handleUsePlatform(reader: HazelReader) {
        void reader;
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
                Buffer.alloc(0)
            )
        );
    }

    usePlatform() {
        this.usePlatform();
        this._rpcUsePlatform();
    }
}
