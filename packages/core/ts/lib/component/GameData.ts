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
    PlayerGameData,
} from "@skeldjs/constant";

import { HazelBuffer } from "@skeldjs/util";

import { Networkable, NetworkableEvents } from "../Networkable";
import { Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";

import { PlayerControl } from "./PlayerControl";
import { PlayerVoteState } from "../misc/PlayerVoteState";

export interface GameDataData {
    dirtyBit: number;
    players: Map<number, PlayerGameData>;
}

export interface GameDataEvents extends NetworkableEvents {
    /**
     * Emitted when a player is added to the game data.
     */
    "gamedata.addplayer": {
        /**
         * The data of the player that was added.
         */
        playerData: PlayerGameData;
    };
    /**
     * Emitted when a player is removed from the game data.
     */
    "gamedata.removeplayer": {
        /**
         * The data of the player that was removed.
         */
        playerData: PlayerGameData;
    };
    /**
     * Emitted when a player has their tasks set.
     */
    "gamedata.settasks": {
        /**
         * The data of the player that had their tasks set.
         */
        playerData: PlayerGameData;
        /**
         * The IDs of the player's tasks.
         */
        taskids: number[];
    };
}

export type PlayerIDResolvable =
    | number
    | PlayerData
    | PlayerControl
    | PlayerGameData
    | PlayerVoteState;

/**
 * Represents a room object containing data about players.
 *
 * See {@link GameDataEvents} for events to listen to.
 */
export class GameData extends Networkable<GameDataData, GameDataEvents> {
    static type = SpawnID.GameData as const;
    type = SpawnID.GameData as const;

    static classname = "GameData" as const;
    classname = "GameData" as const;

    /**
     * The players in the game data.
     */
    players: Map<number, PlayerGameData>;

    constructor(
        room: Hostable,
        netid: number,
        ownerid: number,
        data?: HazelBuffer | GameDataData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as Hostable;
    }

    resolvePlayerData(resolvable: PlayerIDResolvable) {
        return this.players.get(this.room.resolvePlayerId(resolvable));
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            this.players = new Map();

            const num_players = spawn ? reader.upacked() : reader.uint8();

            for (let i = 0; i < num_players; i++) {
                const data = GameData.readPlayerData(reader);

                this.players.set(data.playerId, data);
            }
        }
    }

    Serialize(writer: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            writer.upacked(this.players.size);

            for (const [playerid, player] of this.players) {
                if ((1 << playerid) & this.dirtyBit || spawn) {
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
            return true;
        }
        this.dirtyBit = 0;
        return false;
    }

    PreSerialize() {
        if (this.dirtyBit && this.room.amhost) {
            const players = [...this.players.values()].filter((player) => {
                return (1 << player.playerId) & this.dirtyBit;
            });

            if (players.length) {
                this.room.stream.push({
                    tag: MessageTag.RPC,
                    netid: this.netid,
                    rpcid: RpcTag.UpdateGameData,
                    players: players,
                });
            }
        }
        this.dirtyBit = 0;
    }

    HandleRpc(message: RpcMessage) {
        switch (message.rpcid) {
            case RpcTag.SetTasks:
                this.setTasks;
                break;
            case RpcTag.UpdateGameData:
                for (let i = 0; i < message.players.length; i++) {
                    const data = message.players[i];

                    this.players.set(data.playerId, data);
                }
                break;
        }
    }

    /**
     * Make the player data dirty and update on the next FixedUpdate.
     * @param resolvable The player to make dirty.
     */
    update(resolvable: PlayerIDResolvable) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            this.dirtyBit |= 1 << player.playerId;
        }
    }

    /**
     * Change the name of a player (Will not update on clients, use {@link PlayerControl.setName}).
     * @param resolvable The player to change the name of.
     * @param name The name to change to.
     * @example
     *```typescript
     * room.gamedata.setName(player, "weakeyes");
     * ```
     */
    setName(resolvable: PlayerIDResolvable, name: string) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            player.name = name;
            this.update(player);
        }
    }

    /**
     * Change the colour of a player (Will not update on clients, use {@link PlayerControl.setColor}).
     * @param resolvable The player to change the colour of.
     * @param color The colour to change to.
     * @example
     *```typescript
     * room.gamedata.setColor(player, ColorID.Blue);
     * ```
     */
    setColor(resolvable: PlayerIDResolvable, color: ColorID) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            player.color = color;
            this.update(player);
        }
    }

    /**
     * Change the hat of a player.
     * @param resolvable The player to change the hat of.
     * @param hat The hat to change to.
     * @example
     *```typescript
     * room.gamedata.setHat(player, HatID.TopHat);
     * ```
     */
    setHat(resolvable: PlayerIDResolvable, hat: HatID) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            player.hat = hat;
            this.update(player);
        }
    }

    /**
     * Change the skin of a player.
     * @param resolvable The player to change the skin of.
     * @param skin The skin to change to.
     * @example
     *```typescript
     * room.gamedata.setSkin(player, SkinID.Mechanic);
     * ```
     */
    setSkin(resolvable: PlayerIDResolvable, skin: SkinID) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            player.skin = skin;
            this.update(player);
        }
    }

    /**
     * Change the pet of a player.
     * @param resolvable The player to change the pet of.
     * @param skin The pet to change to.
     * @example
     *```typescript
     * room.gamedata.setPet(player, PetID.MiniCrewmate);
     * ```
     */
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
            player.tasks = taskIds.map((id, i) => ({
                completed: false,
                taskIdx: i,
            }));

            this.emit("gamedata.settasks", {
                playerData: player,
                taskids: taskIds,
            });
        }
    }

    /**
     * Set the tasks of a player.
     * @param resolvable The player to set the tasks of.
     * @param taskIds The tasks to set.
     * @example
     *```typescript
     * room.gamedata.setTasks(player, [
     *   TheSkeldTask.ReactorUnlockManifolds,
     *   TheSkeldTask.ElectricDownloadData,
     *   TheSkeldTask.ShieldsPrimeShields,
     *   TheSkeldTask.NavigationDownloadData
     * ]);
     * ```
     */
    setTasks(resolvable: PlayerIDResolvable, taskIds: number[]) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            this._setTasks(player.playerId, taskIds);
            this.room.stream.push({
                tag: MessageTag.RPC,
                rpcid: RpcTag.SetTasks,
                netid: this.netid,
                playerid: player.playerId,
                taskids: taskIds,
            });
            this.update(player);
        }
    }

    /**
     * Mark a player's task as complete.
     * @param resolvable The player of the tasks to mark complete.
     * @param taskIdx The index of the player's tasks to mark complete.
     * @example
     *```typescript
     * // Complete all of a player's tasks.
     * for (let i = 0; i < player.data.tasks.length; i++) {
     *   room.gamedata.completeTask(player, i);
     * }
     * ```
     */
    completeTask(resolvable: PlayerIDResolvable, taskIdx: number) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            const task = player.tasks[taskIdx];

            if (task) {
                task.completed = true;
            }
        }
    }

    /**
     * Add a player to player data.
     * @param playerId The player ID of the player to add.
     * @example
     *```typescript
     * // Get an available player ID and add it to the gamedata.
     * const playerId = room.getAvailablePlayerID();
     * room.gamedata.add(playerId);
     * ```
     */
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
            tasks: [],
        });

        this.emit("gamedata.addplayer", {
            playerData: this.players.get(playerId),
        });

        this.update(playerId);
        return this.players.get(playerId);
    }

    /**
     * Remove player data from the game data.
     * @param resolvable The player to remove.
     */
    remove(resolvable: PlayerIDResolvable) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            if (this.dirtyBit & (1 << player.playerId)) {
                this.dirtyBit ^= 1 << player.playerId;
            }

            this.emit("gamedata.removeplayer", {
                playerData: this.players.get(player.playerId),
            });

            this.players.delete(player.playerId);
        }
    }

    /**
     * Parse player data from a data buffer.
     * @param reader The reader to read from.
     * @returns The player data as a player data object.
     */
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
