import {
    Color,
    Hat,
    Pet,
    RpcMessageTag,
    Skin,
    SpawnType,
} from "@skeldjs/constant";

import { RpcMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "../Networkable";
import { Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";

import { PlayerControl } from "./PlayerControl";
import { PlayerVoteState } from "../misc/PlayerVoteState";
import { PlayerGameData, TaskState } from "../misc/PlayerGameData";

import {
    GameDataAddPlayerEvent,
    GameDataRemovePlayerEvent,
    GameDataSetTasksEvent,
} from "../events";

export interface GameDataData {
    players: Map<number, PlayerGameData>;
}

export type GameDataEvents =
    NetworkableEvents &
ExtractEventTypes<[
    GameDataAddPlayerEvent,
    GameDataRemovePlayerEvent,
    GameDataSetTasksEvent
]>;

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
    static type = SpawnType.GameData as const;
    type = SpawnType.GameData as const;

    static classname = "GameData" as const;
    classname = "GameData" as const;

    /**
     * The players in the game data.
     */
    players: Map<number, PlayerGameData>;

    constructor(
        room: Hostable<any>,
        netid: number,
        ownerid: number,
        data?: HazelReader | GameDataData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as Hostable;
    }

    resolvePlayerData(resolvable: PlayerIDResolvable) {
        return this.players.get(this.room.resolvePlayerId(resolvable));
    }

    Deserialize(reader: HazelReader, spawn: boolean = false) {
        if (!this.players) this.players = new Map();

        if (spawn) {
            const num_players = reader.upacked();

            for (let i = 0; i < num_players; i++) {
                const playerId = reader.uint8();
                const player = PlayerGameData.Deserialize(reader, playerId);

                this.players.set(player.playerId, player);
            }
        } else {
            while (reader.left) {
                const [playerId, preader] = reader.message();

                const player = this.players.get(playerId);

                if (player) {
                    player.Deserialize(preader);
                } else {
                    const player = PlayerGameData.Deserialize(preader, playerId);

                    this.players.set(player.playerId, player);
                }
            }
        }
    }

    Serialize(writer: HazelWriter, spawn: boolean = false) {
        let flag = false;

        if (spawn) {
            writer.upacked(this.players.size);
        }

        for (const [playerid, player] of this.players) {
            if ((1 << playerid) & this.dirtyBit || spawn) {
                if (spawn) {
                    writer.uint8(player.playerId);
                    writer.write(player);
                } else {
                    writer.begin(player.playerId);
                    writer.write(player);
                    writer.end();
                }
                flag = true;
            }
        }
        this.dirtyBit = 0;
        return flag;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async HandleRpc(callid: RpcMessageTag, reader: HazelReader) {
        switch (callid) {
            case RpcMessageTag.SetTasks:
                this._handleSetTasks(reader);
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
    setColor(resolvable: PlayerIDResolvable, color: Color) {
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
    setHat(resolvable: PlayerIDResolvable, hat: Hat) {
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
    setSkin(resolvable: PlayerIDResolvable, skin: Skin) {
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
    setPet(resolvable: PlayerIDResolvable, pet: Pet) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            player.pet = pet;
            this.update(player);
        }
    }

    private async _handleSetTasks(reader: HazelReader) {
        const playerId = reader.uint8();
        const taskIds = reader.list(r => r.uint8());

        const playerData = this.players.get(playerId);

        if (playerData) {
            this._setTasks(playerData, taskIds);

            await this.emit(
                new GameDataSetTasksEvent(
                    this.room,
                    this,
                    playerData,
                    taskIds
                )
            );
        }
    }

    private _setTasks(player: PlayerGameData, taskIds: number[]) {
        player.tasks = taskIds
            .map((id, i) => new TaskState(i, false));
    }

    private _rpcSetTasks(player: PlayerGameData, taskIds: number[]) {
        const writer = HazelWriter.alloc(2);
        writer.uint8(player.playerId);
        writer.list(true, taskIds, (taskId) => writer.uint8(taskId));

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.SetTasks,
                writer.buffer
            )
        );
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
            this._setTasks(player, taskIds);
            this._rpcSetTasks(player, taskIds);
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
        this.players.set(playerId, new PlayerGameData(playerId));

        this.emit(
            new GameDataAddPlayerEvent(
                this.room,
                this,
                this.players.get(playerId)
            )
        );

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

            this.players.delete(player.playerId);

            this.emit(new GameDataRemovePlayerEvent(this.room, this, player));
        }
    }
}
