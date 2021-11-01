import {
    Color,
    GameOverReason,
    Hat,
    Pet,
    RpcMessageTag,
    Skin,
    SpawnType,
} from "@skeldjs/constant";

import { BaseRpcMessage, RpcMessage, SetTasksMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents, NetworkableConstructor } from "../Networkable";
import { Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";

import { PlayerControl } from "./PlayerControl";
import { PlayerVoteState } from "../misc/PlayerVoteState";
import { PlayerInfo, TaskState } from "../misc/PlayerInfo";

import { VoteBanSystem } from "./component";

import {
    GameDataAddPlayerEvent,
    GameDataRemovePlayerEvent,
    GameDataSetTasksEvent,
} from "../events";
import { AmongUsEndGames, EndGameIntent, FinalTaskState, TasksCompleteEndgameMetadata } from "../endgame";

export interface GameDataData {
    players: Map<number, PlayerInfo>;
}

export type GameDataEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> &
    ExtractEventTypes<
        [
            GameDataAddPlayerEvent<RoomType>,
            GameDataRemovePlayerEvent<RoomType>,
            GameDataSetTasksEvent<RoomType>
        ]
    >;

export type PlayerIDResolvable =
    | number
    | PlayerData
    | PlayerControl
    | PlayerInfo
    | PlayerVoteState;

/**
 * Represents a room object containing data about players.
 *
 * See {@link GameDataEvents} for events to listen to.
 */
export class GameData<RoomType extends Hostable = Hostable> extends Networkable<GameDataData, GameDataEvents<RoomType>, RoomType> implements GameDataData {
    /**
     * The players in the game data.
     */
    players!: Map<number, PlayerInfo<RoomType>>;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | GameDataData
    ) {
        super(room, spawnType, netid, ownerid, flags, data);

        this.players ||= new Map;
    }

    Awake() {
        for (const [ , player ] of this.room.players) {
            if (player.playerId)
                this.add(player.playerId);
        }
    }

    getComponent<T extends Networkable>(
        component: NetworkableConstructor<T>
    ): T|undefined {
        if (component === GameData as NetworkableConstructor<any>) {
            return this.components[0] as unknown as T;
        }

        if (component === VoteBanSystem as NetworkableConstructor<any>) {
            return this.components[1] as unknown as T;
        }

        return super.getComponent(component);
    }

    get owner() {
        return super.owner as RoomType;
    }

    /**
     * Resolve some player identifier to a definite player info object.
     * @param resolvable The player identifier to resolve.
     * @returns A definite player info object.
     */
    resolvePlayerData(resolvable: PlayerIDResolvable) {
        const resolved = this.room.resolvePlayerId(resolvable);

        if (resolved === undefined)
            return undefined;

        return this.players.get(resolved);
    }

    Deserialize(reader: HazelReader, spawn: boolean = false) {
        if (!this.players) this.players = new Map;

        if (spawn) {
            const num_players = reader.upacked();

            for (let i = 0; i < num_players; i++) {
                const playerId = reader.uint8();
                const player = PlayerInfo.Deserialize(reader, this, playerId);

                this.players.set(player.playerId, player);
            }
        } else {
            while (reader.left) {
                const [playerId, preader] = reader.message();

                const player = this.players.get(playerId);

                if (player) {
                    player.Deserialize(preader);
                } else {
                    const player = PlayerInfo.Deserialize(
                        preader,
                        this,
                        playerId
                    );

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
    async HandleRpc(rpc: BaseRpcMessage) {
        switch (rpc.messageTag) {
            case RpcMessageTag.SetTasks:
                this._handleSetTasks(rpc as SetTasksMessage);
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

    private async _handleSetTasks(rpc: SetTasksMessage) {
        const playerData = this.players.get(rpc.playerid);

        if (playerData) {
            const oldTasks = playerData.taskIds;
            this._setTasks(playerData, rpc.taskids);
            const playerTasks = playerData.taskIds;

            const ev = await this.emit(
                new GameDataSetTasksEvent(
                    this.room,
                    this,
                    playerData,
                    oldTasks,
                    playerTasks
                )
            );

            playerData.taskIds = ev.alteredTasks;

            if (ev.alteredTasks !== playerTasks) {
                this._rpcSetTasks(playerData, playerData.taskIds);
            }
        }
    }

    private _setTasks(player: PlayerInfo, taskIds: number[]) {
        player.taskIds = taskIds;
        player.taskStates = taskIds.map((id, i) => new TaskState(i, false));
    }

    private _rpcSetTasks(player: PlayerInfo, taskIds: number[]) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new SetTasksMessage(player.playerId, taskIds)
            )
        );
    }

    /**
     * Set the tasks of a player.
     * @param player The player to set the tasks of.
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
    async setTasks(player: PlayerIDResolvable, taskIds: number[]) {
        const playerData = this.resolvePlayerData(player);

        if (playerData) {
            const oldTasks = playerData.taskIds;
            this._setTasks(playerData, taskIds);
            const ev = await this.emit(
                new GameDataSetTasksEvent(
                    this.room,
                    this,
                    playerData,
                    oldTasks,
                    playerData.taskIds
                )
            );

            this._setTasks(playerData, ev.alteredTasks);

            if (playerData.taskIds !== oldTasks) {
                this._rpcSetTasks(playerData, playerData.taskIds);
                this.update(playerData);
            }
        }
    }

    /**
     * Mark a player's task as complete.
     * @param resolvable The player of the tasks to mark complete.
     * @param taskIdx The index of the player's tasks to mark complete.
     * @example
     *```typescript
     * // Complete all of a player's tasks.
     * for (let i = 0; i < player.info.tasks.length; i++) {
     *   room.gamedata.completeTask(player, i);
     * }
     * ```
     */
    completeTask(resolvable: PlayerIDResolvable, taskIdx: number) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            const task = player.taskStates[taskIdx];

            if (task) {
                task.completed = true;
            }

            let totalTasks = 0;
            let completeTasks = 0;
            const taskStates: Map<number, FinalTaskState[]> = new Map;
            for (const [ , playerInfo ] of this.players) {
                if (!playerInfo.isDisconnected && !playerInfo.isImpostor) {
                    const states: FinalTaskState[] = [];
                    taskStates.set(playerInfo.playerId, states);
                    for (const task of playerInfo.taskStates) {
                        totalTasks++;
                        if (task.completed) {
                            completeTasks++;
                        }
                        states.push({
                            taskId: playerInfo.taskIds[task.taskidx],
                            completed: task.completed
                        });
                    }
                }
            }

            if (totalTasks > 0 && completeTasks >= totalTasks) {
                this.room.registerEndGameIntent(
                    new EndGameIntent<TasksCompleteEndgameMetadata>(
                        AmongUsEndGames.TasksComplete,
                        GameOverReason.HumansByTask,
                        {
                            totalTasks,
                            completeTasks,
                            taskStates
                        }
                    )
                );
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
    async add(playerId: number) {
        const playerInfo = PlayerInfo.createDefault(this, playerId);
        this.players.set(playerId, playerInfo);

        const ev = await this.emit(
            new GameDataAddPlayerEvent(
                this.room,
                this,
                playerInfo
            )
        );

        if (ev.reverted) {
            this.players.delete(playerId);
        } else {
            this.update(playerId);
        }
        return playerInfo;
    }

    /**
     * Remove player data from the game data.
     * @param resolvable The player to remove.
     */
    async remove(resolvable: PlayerIDResolvable) {
        const playerInfo = this.resolvePlayerData(resolvable);

        if (playerInfo) {
            const wasMarked = this.dirtyBit & (1 << playerInfo.playerId);
            if (wasMarked) {
                this.dirtyBit ^= 1 << playerInfo.playerId;
            }

            this.players.delete(playerInfo.playerId);

            const ev = await this.emit(
                new GameDataRemovePlayerEvent(
                    this.room,
                    this,
                    playerInfo
                )
            );

            if (ev.reverted) {
                this.players.set(playerInfo.playerId, playerInfo);
                this.update(playerInfo.playerId);
            }
        }
    }
}
