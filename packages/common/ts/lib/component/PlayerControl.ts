import { HazelBuffer } from "@skeldjs/util";
import { RpcMessage, GameOptions } from "@skeldjs/protocol";

import { PlayerData } from "../PlayerData";
import { Networkable } from "../Networkable"
import { PlayerDataResolvable, Room } from "../Room";

import {
    ColorID,
    MessageID,
    RpcID,
    SpawnID,
    PetID,
    SkinID,
    HatID,
    Opcode,
    PayloadTag
} from "@skeldjs/constant";

export interface PlayerControlData {
    isNew: boolean;
    playerId: number;
}

export class PlayerControl extends Networkable<PlayerData> {
    static type = SpawnID.Player as const;
    type = SpawnID.Player as const;

    static classname = "PlayerControl" as const;
    classname = "PlayerControl" as const;

    private lastStartCounter = 0;
    
    isNew: boolean;
    playerId: number;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|PlayerControlData) {
        super(room, netid, ownerid, data);
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
    }

    HandleRPC(message: RpcMessage) {
        switch (message.rpcid) {
            case RpcID.CompleteTask:
                this._completeTask(message.taskIdx);
                break;
            case RpcID.CheckName:
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
            case RpcID.CheckColor:
                if (this.room.amhost) {
                    if (!this.room.gamedata) {
                        return;
                    }
            
                    const players = [...this.room.gamedata.players.values()];
                    while (players.some(player => player.playerId !== this.playerId && player.color === message.color) && message.color < 13) {
                        message.color++;
                    }
            
                    this.setColor(message.color);
                }
                break;
            case RpcID.SetName:
                this._setName(message.name);
                break;
            case RpcID.SetColor:
                this._setColor(message.color);
                break;
            case RpcID.SetHat:
                this._setHat(message.hat);
                break;
            case RpcID.SetSkin:
                this._setSkin(message.skin);
                break;
            case RpcID.StartMeeting:
                this.emit("meeting", message.bodyid === 0xFF ? null : this.room.getPlayerByPlayerId(message.bodyid));
                break;
            case RpcID.SetPet:
                this._setPet(message.pet);
                break;
        }
    }
    
    async checkName(name: string) {
        if (this.owner.data) {
            await this.room.client.send({
                op: Opcode.Reliable,
                payloads: [
                    {
                        tag: PayloadTag.GameDataTo,
                        code: this.room.code,
                        recipientid: this.room.hostid,
                        messages: [
                            {
                                tag: MessageID.RPC,
                                netid: this.netid,
                                rpcid: RpcID.CheckName,
                                name
                            }
                        ]
                    }
                ]
            });
        }
    }
    
    async checkColor(color: ColorID) {
        if (this.owner.data) {
            await this.room.client.send({
                op: Opcode.Reliable,
                payloads: [
                    {
                        tag: PayloadTag.GameDataTo,
                        code: this.room.code,
                        recipientid: this.room.hostid,
                        messages: [
                            {
                                tag: MessageID.RPC,
                                netid: this.netid,
                                rpcid: RpcID.CheckColor,
                                color
                            }
                        ]
                    }
                ]
            });
        }
    }

    private _completeTask(taskIdx: number) {
        if (this.room.gamedata) this.room.gamedata.completeTask(this.playerId, taskIdx);
    }

    private _setName(name: string) {
        if (this.room.gamedata) this.room.gamedata.setName(this.playerId, name);
    }

    private _setColor(color: ColorID) {
        if (this.room.gamedata) this.room.gamedata.setColor(this.playerId, color);
    }

    private _setHat(hat: HatID) {
        if (this.room.gamedata) this.room.gamedata.setHat(this.playerId, hat);
    }

    private _setSkin(skin: SkinID) {
        if (this.room.gamedata) this.room.gamedata.setSkin(this.playerId, skin);
    }

    private _setPet(pet: PetID) {
        if (this.room.gamedata) this.room.gamedata.setPet(this.playerId, pet);
    }

    completeTask(taskIdx: number) {
        this._completeTask(taskIdx);

        this.room.client.stream.push({
            tag: MessageID.RPC,
            rpcid: RpcID.CompleteTask,
            netid: this.netid,
            taskIdx
        });
    }

    murder(victim: PlayerDataResolvable) {
        const res_victim = this.room.resolvePlayer(victim);

        if (res_victim && res_victim.control) {
            this.room.client.stream.push({
                tag: MessageID.RPC,
                rpcid: RpcID.MurderPlayer,
                netid: this.netid,
                victimid: res_victim.control.netid
            });
        }
    }

    setName(name: string) {
        this._setName(name);

        if (this.owner.ishost) {
            this.room.client.stream.push({
                tag: MessageID.RPC,
                rpcid: RpcID.SetName,
                netid: this.netid,
                name
            });
        }
    }

    setColor(color: ColorID) {
        this._setColor(color);

        if (this.owner.ishost) {
            this.room.client.stream.push({
                tag: MessageID.RPC,
                rpcid: RpcID.SetColor,
                netid: this.netid,
                color
            });
        }
    }
    
    setHat(hat: HatID) {
        this._setHat(hat);

        this.room.client.stream.push({
            tag: MessageID.RPC,
            rpcid: RpcID.SetHat,
            netid: this.netid,
            hat
        });
    }
    
    setSkin(skin: SkinID) {
        this._setSkin(skin);

        this.room.client.stream.push({
            tag: MessageID.RPC,
            rpcid: RpcID.SetSkin,
            netid: this.netid,
            skin
        });
    }
    
    setPet(pet: PetID) {
        this._setPet(pet);

        this.room.client.stream.push({
            tag: MessageID.RPC,
            rpcid: RpcID.SetPet,
            netid: this.netid,
            pet
        });
    }

    chat(message: string) {
        this.room.client.stream.push({
            tag: MessageID.RPC,
            rpcid: RpcID.SendChat,
            netid: this.netid,
            message
        });
    }
    
    syncSettings(update_settings: Partial<GameOptions> = this.room.settings) {
        const settings = {
            ...this.room.settings,
            ...update_settings
        } as GameOptions;

        this.room.settings = settings;

        this.room.client.stream.push({
            tag: MessageID.RPC,
            netid: this.netid,
            rpcid: RpcID.SyncSettings,
            settings: settings
        });
    }

    setStartCounter(counter: number) {
        if (this.owner.ishost) {
            this.lastStartCounter++;
            
            this.room.client.stream.push({
                tag: MessageID.RPC,
                netid: this.netid,
                rpcid: RpcID.SetStartCounter,
                seqId: this.lastStartCounter,
                time: counter
            });
        }
    }

    setInfected(players: PlayerDataResolvable[]) {
        const resolved = players.map(this.room.resolvePlayer).filter(_=>_);

        for (let i = 0; i < resolved.length; i++) {
            const player = resolved[i];

            if (player.data) {
                player.data.impostor = true;
            }
        }

        if (this.owner.ishost) {
            this.room.client.stream.push({
                tag: MessageID.RPC,
                netid: this.netid,
                rpcid: RpcID.SetInfected,
                impostors: resolved.map(player => player.playerId)
            });
        }
    }
}