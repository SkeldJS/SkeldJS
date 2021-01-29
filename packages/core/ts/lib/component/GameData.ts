import { RpcMessage } from "@skeldjs/protocol";

import {
    ColorID,
    HatID,
    MessageTag,
    PetID,
    RpcTag,
    SkinID,
    SpawnID,
    PlayerDataFlags,
    PlayerGameData
} from "@skeldjs/constant";

import { HazelBuffer } from "@skeldjs/util"

import { Networkable } from "../Networkable";
import { Global } from "../Global";
import { Room } from "../Room";
import { PlayerData } from "../PlayerData";

import { PlayerControl } from "./PlayerControl";
import { PlayerVoteState } from "../misc/PlayerVoteState";

export interface GameDataData {
    dirtyBit: number;
    players: Map<number, PlayerGameData>;
}

export type GameDataEvents = {
    addPlayerData: (playerData: PlayerGameData) => void;
    removePlayerData: (playerData: PlayerGameData) => void;
}

export type PlayerIDResolvable = number|PlayerData|PlayerControl|PlayerGameData|PlayerVoteState;

export class GameData extends Networkable<GameDataEvents> {
    static type = SpawnID.GameData as const;
    type = SpawnID.GameData as const;

    static classname = "GameData" as const;
    classname = "GameData" as const;

    players: Map<number, PlayerGameData>;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|GameDataData) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as Global;
    }

    resolvePlayerData(resolvable: PlayerIDResolvable) {
        return this.players.get(this.room.resolvePlayerId(resolvable));
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            this.dirtyBit = 0;
            this.players = new Map;
        }

        const num_players = spawn ? reader.upacked() : reader.uint8();

        for (let i = 0; i < num_players; i++) {
            const data = GameData.readPlayerData(reader);

            this.players.set(data.playerId, data);
        }
    }

    Serialize(writer: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            writer.upacked(this.players.size);
        } else {
            writer.uint8(this.dirtyBit.toString(2).split("1").length - 1);
        }

        for (const [ playerid, player ] of this.players) {
            if (((1 << playerid) & this.dirtyBit) || spawn) {
                writer.uint8(player.playerId);
                writer.string(player.name);
                writer.upacked(player.color);
                writer.upacked(player.hat);
                writer.upacked(player.pet);
                writer.upacked(player.skin);
                writer.byte(
                    (player.disconnected ? 1 : 0) |
                    (player.impostor ? 2 : 0) |
                    (player.dead ? 4 : 0)
                );

                writer.uint8(player.tasks.length);
                for (let i = 0; i < player.tasks.length; i++) {
                    const task = player.tasks[i];
                    writer.upacked(task.taskIdx);
                    writer.bool(task.completed);
                }
            }
        }
    }

    HandleRPC(message: RpcMessage) {
        switch (message.rpcid) {
            case RpcTag.SetTasks:
                this.setTasks
                break;
            case RpcTag.UpdateGameData:
                for (let i = 0; i < message.players.length; i++) {
                    const data = message.players[i];

                    this.players.set(data.playerId, data);
                }
                break;
        }
    }

    FixedUpdate() {
        if (this.dirtyBit && this.room.amhost) {
            const players = [...this.players.values()].filter(player => {
                return (1 << player.playerId) & this.dirtyBit;
            });

            if (players.length) {
                this.room.client.stream.push({
                    tag: MessageTag.RPC,
                    netid: this.netid,
                    rpcid: RpcTag.UpdateGameData,
                    players: players
                });
            }
        }

        this.dirtyBit = 0;
    }

    update(resolvable: PlayerIDResolvable) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            this.dirtyBit |= (1 << player.playerId);
        }
    }

    setName(resolvable: PlayerIDResolvable, name: string) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            player.name = name;
            this.update(player);
        }
    }

    setColor(resolvable: PlayerIDResolvable, color: ColorID) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            player.color = color;
            this.update(player);
        }
    }

    setHat(resolvable: PlayerIDResolvable, hat: HatID) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            player.hat = hat;
            this.update(player);
        }
    }

    setSkin(resolvable: PlayerIDResolvable, skin: SkinID) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            player.skin = skin;
            this.update(player);
        }
    }

    setPet(resolvable: PlayerIDResolvable, pet: PetID) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            player.pet = pet;
            this.update(player);
        }
    }

    private _setTasks(playerId: number, taskIds: number[]) {
        const player = this.players.get(playerId);

        if (player) {
            player.tasks = [];
            this.emit("setTasks", player);
            taskIds;
        }
    }

    setTasks(resolvable: PlayerIDResolvable, taskIds: number[]) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            player.tasks = [];
            taskIds;
        }
    }

    completeTask(resolvable: PlayerIDResolvable, taskIdx: number) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            const task = player.tasks[taskIdx];

            if (task) {
                task.completed = true;
            }
        }
    }

    add(playerId: number) {
        this.players.set(playerId, {
            playerId,
            name: "",
            color: 0,
            hat: 0,
            pet: 0,
            skin: 0,
            disconnected: false,
            impostor: false,
            dead: false,
            tasks: []
        });

        this.emit("addPlayerData", this.players.get(playerId));

        this.update(playerId);
    }

    remove(resolvable: PlayerIDResolvable) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            if (this.dirtyBit & (1 << player.playerId)) {
                this.dirtyBit ^= (1 << player.playerId);
            }

            this.emit("removePlayerData", this.players.get(player.playerId));

            this.players.delete(player.playerId);
        }
    }

    static readPlayerData(reader: HazelBuffer): PlayerGameData {
        const data: Partial<PlayerGameData> = {};
        data.playerId = reader.uint8();
        data.name = reader.string();
        data.color = reader.upacked();
        data.hat = reader.upacked();
        data.pet = reader.upacked();
        data.skin = reader.upacked();

        const flags = reader.byte();
        data.disconnected = (flags & PlayerDataFlags.IsDisconnected) > 0;
        data.impostor = (flags & PlayerDataFlags.IsImpostor) > 0;
        data.dead = (flags & PlayerDataFlags.IsDead) > 0;

        data.tasks = [];
        const num_tasks = reader.uint8();
        for (let i = 0; i < num_tasks; i++) {
            const taskIdx = reader.upacked();
            const completed = reader.bool();

            data.tasks.push({ taskIdx, completed });
        }

        return data as PlayerGameData;
    }
}
