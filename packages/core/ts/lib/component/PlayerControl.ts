import { HazelBuffer } from "@skeldjs/util";
import { RpcMessage, GameOptions } from "@skeldjs/protocol";

import {
    ColorID,
    MessageTag,
    RpcTag,
    SpawnID,
    PetID,
    SkinID,
    HatID,
    ChatNoteType,
    TaskState
} from "@skeldjs/constant";

import { Networkable, NetworkableEvents } from "../Networkable"
import { PlayerData } from "../PlayerData";
import { PlayerDataResolvable, Hostable } from "../Hostable";

export interface PlayerControlData {
    isNew: boolean;
    playerId: number;
}

export type PlayerControlEvents = NetworkableEvents & {
    "player.completetask": {
        task: TaskState;
    };
    "player.setname": {
        name: string;
    };
    "player.setcolor": {
        color: ColorID;
    }
    "player.sethat": {
        hat: HatID;
    }
    "player.setskin": {
        skin: SkinID;
    };
    "player.setpet": {
        pet: PetID;
    };
    "player.syncsettings": {
        settings: GameOptions;
    };
    "player.setstartcounter": {
        counter: number;
    };
    "player.setimpostors": {
        impostors: PlayerData[];
    };
    "player.murder": {
        victim: PlayerData;
    };
    "player.meeting": {
        body: PlayerData|null;
    };
    "player.chat": {
        message: string;
    };
}

export class PlayerControl extends Networkable<PlayerControlEvents> {
    static type = SpawnID.Player as const;
    type = SpawnID.Player as const;

    static classname = "PlayerControl" as const;
    classname = "PlayerControl" as const;

    private lastStartCounter = 0;

    isNew: boolean;
    playerId: number;

    constructor(room: Hostable, netid: number, ownerid: number, data?: HazelBuffer|PlayerControlData) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as PlayerData;
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            this.isNew = reader.bool();
        }

        this.playerId = reader.uint8();
    }

    Serialize(writer: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            writer.bool(this.isNew);
            this.isNew = false;
        }

        writer.uint8(this.playerId);
        return true;
    }

    HandleRPC(message: RpcMessage) {
        switch (message.rpcid) {
            case RpcTag.CompleteTask:
                this._completeTask(message.taskIdx);
                break;
            case RpcTag.SyncSettings:
                this._syncSettings(message.settings);
                break;
            case RpcTag.SetInfected:
                this._setInfected(message.impostors);
                break;
            case RpcTag.CheckName:
                if (this.room.amhost) {
                    if (!this.room.gamedata) {
                        return;
                    }

                    const players = [...this.room.gamedata.players.values()];
                    if (players.some(player => player.playerId !== this.playerId && player.name.toLowerCase() === message.name.toLowerCase())) {
                        for (let i = 1; i < 100; i++) {
                            const new_name = message.name + " " + i;

                            if (!players.some(player => player.playerId !== this.playerId && player.name.toLowerCase()  === new_name.toLowerCase() )) {
                                this.setName(new_name);
                                return;
                            }
                        }
                    }

                    this.setName(message.name);
                }
                break;
            case RpcTag.CheckColor:
                if (this.room.amhost) {
                    if (!this.room.gamedata) {
                        return;
                    }

                    const players = [...this.room.gamedata.players.values()];
                    while (players.some(player => player.playerId !== this.playerId && player.color === message.color)) {
                        message.color++;
                        if (message.color > 11) {
                            message.color = 0;
                        }
                    }

                    this.setColor(message.color);
                }
                break;
            case RpcTag.SetName:
                this._setName(message.name);
                break;
            case RpcTag.SetColor:
                this._setColor(message.color);
                break;
            case RpcTag.SetHat:
                this._setHat(message.hat);
                break;
            case RpcTag.SetSkin:
                this._setSkin(message.skin);
                break;
            case RpcTag.MurderPlayer:
                this._murderPlayer(message.victimid);
                break;
            case RpcTag.SendChat:
                this._chat(message.message);
                break;
            case RpcTag.StartMeeting:
                this._startMeeting(message.bodyid);
                break;
            case RpcTag.SetPet:
                this._setPet(message.pet);
                break;
            case RpcTag.SetStartCounter:
                this._setStartCounter(message.time);
                break;
        }
    }

    async checkName(name: string) {
        await this.room.broadcast([{
            tag: MessageTag.RPC,
            netid: this.netid,
            rpcid: RpcTag.CheckName,
            name
        }], true, this.room.host);
    }

    async checkColor(color: ColorID) {
        await this.room.broadcast([{
            tag: MessageTag.RPC,
            netid: this.netid,
            rpcid: RpcTag.CheckColor,
            color
        }], true, this.room.host);
    }

    private _completeTask(taskIdx: number) {
        if (this.room.gamedata) {
            this.room.gamedata.completeTask(this.playerId, taskIdx);

            if (this.owner.data && this.owner.data.tasks) {
                this.emit("player.completetask", {
                    task: this.owner.data.tasks[taskIdx]
                });
            }
        }
    }

    completeTask(taskIdx: number) {
        this._completeTask(taskIdx);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.CompleteTask,
            netid: this.netid,
            taskIdx
        });
    }

    murder(victim: PlayerDataResolvable) {
        const res_victim = this.room.resolvePlayer(victim);

        if (res_victim && res_victim.control) {
            this.room.stream.push({
                tag: MessageTag.RPC,
                rpcid: RpcTag.MurderPlayer,
                netid: this.netid,
                victimid: res_victim.control.netid
            });
        }
    }


    private _setName(name: string) {
        if (this.room.gamedata) {
            this.room.gamedata.setName(this.playerId, name);

            this.emit("player.setname", { name });
        }
    }

    setName(name: string) {
        this._setName(name);

        if (this.room.amhost) {
            this.room.stream.push({
                tag: MessageTag.RPC,
                rpcid: RpcTag.SetName,
                netid: this.netid,
                name
            });
        }
    }

    private _setColor(color: ColorID) {
        if (this.room.gamedata) {
            this.room.gamedata.setColor(this.playerId, color);

            this.emit("player.setcolor", { color });
        }
    }

    setColor(color: ColorID) {
        this._setColor(color);

        if (this.room.amhost) {
            this.room.stream.push({
                tag: MessageTag.RPC,
                rpcid: RpcTag.SetColor,
                netid: this.netid,
                color
            });
        }
    }

    private _setHat(hat: HatID) {
        if (this.room.gamedata) {
            this.room.gamedata.setHat(this.playerId, hat);

            this.emit("player.sethat", { hat });
        }
    }

    setHat(hat: HatID) {
        this._setHat(hat);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.SetHat,
            netid: this.netid,
            hat
        });
    }

    private _setSkin(skin: SkinID) {
        if (this.room.gamedata) {
            this.room.gamedata.setSkin(this.playerId, skin);

            this.emit("player.setskin", { skin });
        }
    }

    setSkin(skin: SkinID) {
        this._setSkin(skin);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.SetSkin,
            netid: this.netid,
            skin
        });
    }

    private _setPet(pet: PetID) {
        if (this.room.gamedata) {
            this.room.gamedata.setPet(this.playerId, pet);

            this.emit("player.setpet", { pet });
        }
    }

    setPet(pet: PetID) {
        this._setPet(pet);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.SetPet,
            netid: this.netid,
            pet
        });
    }

    private _chat(message: string) {
        this.emit("player.chat", { message });
    }

    chat(message: string) {
        this._chat(message);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.SendChat,
            netid: this.netid,
            message
        });
    }

    sendChatNote(type: ChatNoteType) {
        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.SendChatNote,
            netid: this.netid,
            playerid: this.playerId,
            type: type
        });
    }

    private _syncSettings(settings: GameOptions) {
        this.room.settings = settings;

        this.emit("player.syncsettings", { settings });
    }

    syncSettings(update_settings: Partial<GameOptions> = this.room.settings) {
        const settings = {
            ...this.room.settings,
            ...update_settings
        } as GameOptions;

        this._syncSettings(settings);

        this.room.stream.push({
            tag: MessageTag.RPC,
            netid: this.netid,
            rpcid: RpcTag.SyncSettings,
            settings: settings
        });
    }

    private _setStartCounter(counter: number) {
        this.lastStartCounter++;
        this.emit("player.setstartcounter", { counter });
    }

    setStartCounter(counter: number) {
        this._setStartCounter(counter);

        this.room.stream.push({
            tag: MessageTag.RPC,
            netid: this.netid,
            rpcid: RpcTag.SetStartCounter,
            seqId: this.lastStartCounter,
            time: counter
        });
    }

    private _setInfected(playerids: number[]) {
        const impostors: PlayerData[] = [];

        for (let i = 0; i < playerids.length; i++) {
            const playerid = playerids[i];

            const resolved = this.room.getPlayerByPlayerId(playerid);

            if (resolved) {
                impostors.push(resolved);

                if (resolved.data) {
                    resolved.data.impostor = true;
                }
            }
        }

        this.emit("player.setimpostors", { impostors });
    }

    setInfected(players: PlayerDataResolvable[]) {
        const resolved = players.map(player => this.room.resolvePlayer(player)).filter(_=>_);

        this._setInfected(resolved.map(player => player.playerId));

        this.room.stream.push({
            tag: MessageTag.RPC,
            netid: this.netid,
            rpcid: RpcTag.SetInfected,
            impostors: resolved.map(player => player.playerId)
        });
    }

    private _murderPlayer(netid: number) {
        const resolved = this.room.getPlayerByNetID(netid);

        if (resolved) {
            this.emit("player.murder", { victim: resolved });
        }
    }

    private _startMeeting(bodyid: number) {
        this.emit("player.meeting", {
            body: bodyid === 0xFF ? null : this.room.getPlayerByPlayerId(bodyid)
        });
    }

    startMeeting(body: PlayerDataResolvable|"emergency") {
        const resolved = body === "emergency" ? null : this.room.resolvePlayer(body);

        if (resolved || body === "emergency") {
            this.room.stream.push({
                tag: MessageTag.RPC,
                netid: this.netid,
                rpcid: RpcTag.StartMeeting,
                bodyid: body === "emergency" ? 255 : resolved.playerId
            });
        }
    }

    reportDeadBody(body: PlayerDataResolvable|"emergency") {
        const resolved = body === "emergency" ? null : this.room.resolvePlayer(body);

        if (resolved || body === "emergency") {
            this.room.broadcast([{
                tag: MessageTag.RPC,
                netid: this.netid,
                rpcid: RpcTag.ReportDeadBody,
                bodyid: body === "emergency" ? 255 : resolved.playerId
            }], true, this.room.host);
        }
    }
}
