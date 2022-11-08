import {
    GameOverReason,
    RpcMessageTag,
    SpawnType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TaskType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SpawnFlag
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

import {
    AmongUsEndGames,
    EndGameIntent,
    TasksCompleteEndgameMetadata
} from "../endgame";

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
        netId: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | GameDataData
    ) {
        super(room, spawnType, netId, ownerid, flags, data);

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
        if (this.spawnType === SpawnType.GameData) {
            if (component === GameData as NetworkableConstructor<any>) {
                return this.components[0] as unknown as T;
            }

            if (component === VoteBanSystem as NetworkableConstructor<any>) {
                return this.components[1] as unknown as T;
            }
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
        if (!this.players)
            this.players = new Map;

        while (reader.left) {
            const [ playerId, preader ] = reader.message();

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

    Serialize(writer: HazelWriter, spawn: boolean = false) {
        let flag = false;

        for (const [ playerId, player ] of this.players) {
            if (((1 << playerId) & this.dirtyBit) || spawn) {
                writer.begin(player.playerId);
                writer.write(player);
                writer.end();
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
    markDirty(resolvable: PlayerIDResolvable) {
        const player = this.resolvePlayerData(resolvable);

        if (player) {
            this.dirtyBit |= 1 << player.playerId;
        }
    }

    private async _handleSetTasks(rpc: SetTasksMessage) {
        const playerData = this.players.get(rpc.playerId);

        if (playerData) {
            const oldTasks = playerData.taskStates;
            playerData.setTaskStates(rpc.taskIds.map(taskType => new TaskState(taskType, false)));
            const playerTasks = playerData.taskStates;

            const ev = await this.emit(
                new GameDataSetTasksEvent(
                    this.room,
                    this,
                    playerData,
                    oldTasks,
                    playerTasks
                )
            );

            playerData.setTaskStates(ev.alteredTasks);

            if (ev.alteredTasks !== playerTasks) {
                this._rpcSetTasks(playerData, playerData.taskStates);
            }
        }
    }

    private _rpcSetTasks(player: PlayerInfo, taskStates: TaskState[]) {
        this.room.messageStream.push(
            new RpcMessage(
                this.netId,
                new SetTasksMessage(player.playerId, taskStates.map(state => state.taskType))
            )
        );
    }

    /**
     * Set the tasks of a player.
     * @param player The player to set the tasks of.
     * @param taskTypes The task types to give to the player, see {@link TaskType}.
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
    async setTasks(player: PlayerIDResolvable, taskTypes: number[]) {
        const playerData = this.resolvePlayerData(player);

        if (playerData) {
            const oldTasks = playerData.taskStates;
            playerData.setTaskStates(taskTypes.map(taskType => new TaskState(taskType, false)));
            const ev = await this.emit(
                new GameDataSetTasksEvent(
                    this.room,
                    this,
                    playerData,
                    oldTasks,
                    playerData.taskStates
                )
            );

            playerData.setTaskStates(ev.alteredTasks);

            if (playerData.taskStates !== oldTasks) {
                this._rpcSetTasks(playerData, playerData.taskStates);
                this.markDirty(playerData);
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
     * for (let i = 0; i < player.playerInfo.tasks.length; i++) {
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
            } else {
                player.taskStates[taskIdx] = new TaskState(0, true);
            }

            let totalTasks = 0;
            let completeTasks = 0;
            const taskStates: Map<number, TaskState[]> = new Map;
            for (const [ , playerInfo ] of this.players) {
                if (!playerInfo.isDisconnected && !playerInfo.isImpostor) {
                    taskStates.set(playerInfo.playerId, playerInfo.taskStates);
                    for (let i = 0; i < playerInfo.taskStates.length; i++) {
                        totalTasks++;
                        if (playerInfo.taskStates[i].completed) {
                            completeTasks++;
                        }
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
            this.markDirty(playerId);
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
                this.markDirty(playerInfo.playerId);
            }
        }
    }
}
