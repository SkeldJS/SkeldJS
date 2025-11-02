import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/hazel";
import { ExtractEventTypes } from "@skeldjs/events";

import {
    RpcMessageTag,
    SpawnType,
    SystemType,
    TaskData,
    TaskType
} from "@skeldjs/constant";

import {
    BaseSystemMessage,
    BaseRpcMessage,
    CloseDoorsOfTypeMessage,
    ShipStatusDataMessage,
    SystemDataMessage,
    UnknownDataMessage,
    UpdateSystemMessage,
    UnknownSystemMessage,
    RpcMessage
} from "@skeldjs/protocol";

import {
    AutoDoorsSystemEvents,
    DeconSystemEvents,
    DoorsSystem,
    DoorsSystemEvents,
    ElectricalDoorsSystemEvents,
    HqHudSystemEvents,
    HeliSabotageSystemEvents,
    LifeSuppSystemEvents,
    MedScanSystemEvents,
    MovingPlatformSystemEvents,
    ReactorSystemEvents,
    SabotageSystemEvents,
    SecurityCameraSystemEvents,
    SwitchSystemEvents,
    System,
    AutoDoorsSystem,
    SystemEvents,
    SabotagableSystemEvents,
} from "../systems";

import { DataState, NetworkedObject, NetworkedObjectEvents } from "../NetworkedObject";
import { StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";;
import { CustomNetworkTransform } from "./CustomNetworkTransform";

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export type SystemConstructor<T> = {
    new(
        shipStatus: ShipStatus<StatefulRoom>,
        systemType: SystemType,
    ): T;
};

type AllSystems<RoomType extends StatefulRoom> = Map<SystemType, System<RoomType, any>>;

export type ShipStatusEvents<RoomType extends StatefulRoom> = SystemEvents<RoomType> &
    SabotagableSystemEvents<RoomType> &
    DoorsSystemEvents<RoomType> &
    AutoDoorsSystemEvents<RoomType> &
    DeconSystemEvents<RoomType> &
    ElectricalDoorsSystemEvents<RoomType> &
    HqHudSystemEvents<RoomType> &
    HeliSabotageSystemEvents<RoomType> &
    LifeSuppSystemEvents<RoomType> &
    MedScanSystemEvents<RoomType> &
    MovingPlatformSystemEvents<RoomType> &
    ReactorSystemEvents<RoomType> &
    SabotageSystemEvents<RoomType> &
    SecurityCameraSystemEvents<RoomType> &
    SwitchSystemEvents<RoomType> &
    ExtractEventTypes<[]>;

export abstract class ShipStatus<RoomType extends StatefulRoom> extends NetworkedObject<RoomType, ShipStatusEvents<RoomType>> {
    static roomDoors: Partial<Record<SystemType, number[]>>;

    systems: AllSystems<RoomType> = new Map;
    spawnRadius: number = 1.55;
    initialSpawnCenter: Vector2 = Vector2.null;
    meetingSpawnCenter: Vector2 = Vector2.null;

    get owner() {
        return super.owner as RoomType;
    }

    async processAwake(): Promise<void> {
        await this.setupSystems();
    }
    
    parseData(state: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (state) {
        case DataState.Spawn:
        case DataState.Update: return ShipStatusDataMessage.deserializeFromReaderState(reader, state === DataState.Spawn);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof ShipStatusDataMessage) {
            for (const systemData of data.systems) {
                const system = this.systems.get(systemData.systemType);
                if (!system) continue;
                if (systemData.data instanceof UnknownDataMessage) {
                    const parsedData = system.parseData(data.isSpawn ? DataState.Spawn : DataState.Update, systemData.data.dataReader);
                    if (parsedData) {
                        await system.handleData(parsedData);
                    }
                } else {
                    await system.handleData(systemData.data);
                }
            }
        }
    }

    createData(state: DataState): BaseSystemMessage | undefined {
        switch (state) {
        case DataState.Spawn:
        case DataState.Update:
            const systemsData = [];
            for (const [ systemType, system ] of this.systems) {
                if (state === DataState.Spawn || system.isDirty) {
                    const systemData = system.createData(state);
                    if (systemData) {
                        systemsData.push(new SystemDataMessage(systemType, systemData));
                    }
                    system.cancelDataUpdate();
                }
            }
            if (systemsData.length > 0) return new ShipStatusDataMessage(state === DataState.Spawn, systemsData);
        }
        return undefined;
    }

    parseRemoteCall(rpcTag: RpcMessageTag, reader: HazelReader): BaseRpcMessage | undefined {
        switch (rpcTag) {
            case RpcMessageTag.CloseDoorsOfType: return CloseDoorsOfTypeMessage.deserializeFromReader(reader);
            case RpcMessageTag.UpdateSystem: return UpdateSystemMessage.deserializeFromReader(reader);
        }
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {
        if (rpc instanceof CloseDoorsOfTypeMessage) return await this._handleCloseDoorsOfType(rpc);
        if (rpc instanceof UpdateSystemMessage) return await this._handleUpdateSystem(rpc);
    }

    async processFixedUpdate(deltaSeconds: number) {
        for (const [, system] of this.systems) {
            await system.processFixedUpdate(deltaSeconds);
        }
    }

    protected async _handleCloseDoorsOfType(rpc: CloseDoorsOfTypeMessage) {
        await this.closeDoorsOfTypeWithAuth(rpc.systemType);
    }

    async closeDoorsOfTypeWithAuth(systemType: SystemType) {
        const doorSystem = this.systems.get(SystemType.Doors) as DoorsSystem<RoomType> | AutoDoorsSystem<RoomType>;
        if (!doorSystem) return; // TODO: throw exception
        await doorSystem.closeDoorsWithAuth(systemType);
    }

    async closeDoorsOfTypeRequest(systemType: SystemType) {
        await this.room.broadcastImmediate(
            [
                new RpcMessage(
                    this.netId,
                    new CloseDoorsOfTypeMessage(systemType)
                ),
            ],
            undefined,
            [this.room.authorityId]
        );
    }

    async closeDoorsOfType(systemType: SystemType) {
        if (this.room.canManageObject(this)) {
            await this.closeDoorsOfTypeWithAuth(systemType);
        } else {
            await this.closeDoorsOfTypeRequest(systemType);
        }
    }

    protected async _handleUpdateSystem(rpc: UpdateSystemMessage) {
        const player = this.room.getPlayerByNetId(rpc.playerControlNetId);
        if (player && player instanceof Player) {
            const system = this.systems.get(rpc.systemType);
            if (system) {
                if (rpc.data instanceof UnknownSystemMessage) {
                    const parsedUpdate = system.parseUpdate(rpc.data.dataReader);
                    if (!parsedUpdate) return;
                    await system.handleUpdate(player, parsedUpdate);
                } else {
                    await system.handleUpdate(player, rpc.data);
                }
            }
        }
    }

    protected addTasksFromList(
        start: number,
        count: number,
        tasks: number[],
        usedTaskTypes: Set<TaskType>,
        unusedTasks: TaskData[]
    ) {
        if (unusedTasks.length === 0) {
            return start;
        }

        let numLoops = 0; // fun fact: nodepolus calls this a "sanity check"
        let i = 0;
        while (i < count && numLoops++ < 1000) {
            if (start >= unusedTasks.length) {
                start = 0;
                shuffleArray(unusedTasks);
                if (unusedTasks.every(taskData => usedTaskTypes.has(taskData.type))) {
                    usedTaskTypes.clear();
                }
            }

            const id = start++;
            const task = unusedTasks[id];

            if (usedTaskTypes.has(task.type)) {
                i--;
            } else {
                usedTaskTypes.add(task.type);
                tasks.push(id);
            }

            i++;
        }

        return start;
    }

    /**
     * Randomly assign tasks to all players, using data from @skeldjs/constant.
     */
    async assignTasks() {
        const allTasks = this.getTasks();
        const numCommon = this.room.settings.commonTasks;
        const numLong = this.room.settings.longTasks;
        const numShort = this.room.settings.shortTasks;

        const allCommon = [];
        const allLong = [];
        const allShort = [];

        for (let i = 0; i < allTasks.length; i++) {
            switch (allTasks[i].length) {
                case "Common":
                    allCommon.push(allTasks[i]);
                    break;
                case "Long":
                    allLong.push(allTasks[i]);
                    break;
                case "Short":
                    allShort.push(allTasks[i]);
                    break;
            }
        }

        shuffleArray(allCommon);
        shuffleArray(allLong);
        shuffleArray(allShort);

        const usedTaskTypes: Set<TaskType> = new Set;
        const commonTasks: number[] = [];

        this.addTasksFromList(0, numCommon, commonTasks, usedTaskTypes, allCommon);

        let shortIdx = 0;
        let longIdx = 0;
        for (const [, player] of this.room.players) {
            const playerInfo = player.getPlayerInfo();

            if (!playerInfo)
                continue;

            usedTaskTypes.clear();
            const playerTasks: number[] = [...commonTasks];

            shortIdx = this.addTasksFromList(shortIdx, numShort, playerTasks, usedTaskTypes, allShort);
            longIdx = this.addTasksFromList(longIdx, numLong, playerTasks, usedTaskTypes, allLong);

            await playerInfo.setTasks(playerTasks);
        }
    }

    /**
     * Get the spawn position of a player whether they are about to spawn after
     * starting or whether they are about to spawn after a meeting.
     * @param player The player or player ID to determine the position of.
     * @param initialSpawn Whther or not this is a spawn after starting the game.
     * @returns The spawn position of the player.
     */
    getSpawnPosition(player: Player<RoomType> | number, initialSpawn: boolean) {
        const playerId = typeof player === "number"
            ? player
            : player.getPlayerId()!;

        return Vector2.up
            .rotateDeg((playerId - 1) * (360 / this.room.players.size))
            .mul(this.spawnRadius)
            .add(initialSpawn
                ? this.initialSpawnCenter
                : this.meetingSpawnCenter)
            .add(new Vector2(0, 0.3636));
    }

    /**
     * Teleport a player to their spawn position, calculated using
     * {@link ShipStatus.getSpawnPosition}.
     * @param player The player to determine the position of.
     * @param initialSpawn Whether or not this is a spawn after starting the game.
     * @param broadcast Whether or not to broadcast the updates.
     */
    async positionPlayerAtSpawn(player: Player<RoomType>, initialSpawn: boolean, broadcast: boolean) {
        if (player.getPlayerId() === undefined)
            return;

        const spawnPosition = this.getSpawnPosition(player, initialSpawn);
        const playerTransform = player.characterControl?.getComponentSafe(2, CustomNetworkTransform);
        await playerTransform?.snapTo(spawnPosition, broadcast);
    }

    anySystemsSabotaged(): boolean {
        // TODO: this is probably slow af!
        for (const [ , system ] of this.systems) {
            if (system.canBeSabotaged() && system.isSabotaged()) return true;
        }
        return false;
    }

    getSystemSafe<T>(systemType: SystemType, SystemClass: SystemConstructor<T>): T|undefined {
        const system = this.systems.get(systemType);
        if (system instanceof SystemClass) return system;
        return undefined;
    }

    async repairCriticalSystemsWithAuth(): Promise<void> {
        for (const [ , system ] of this.systems) {
            if (system.canBeSabotaged() && system.isCritical()) {
                await system.fullyRepairWithAuth();
            }
        }
    }

    async repairAllSystemsWithAuth(): Promise<void> {
        for (const [ , system ] of this.systems) {
            if (system.canBeSabotaged()) {
                await system.fullyRepairWithAuth();
            }
        }
    }

    /**
     * Get all tasks for this map.
     * @returns A list of tasks for this map.
     */
    abstract getTasks(): TaskData[];
    abstract setupSystems(): Promise<void>;
    abstract getStartWaitSeconds(): number;
}
