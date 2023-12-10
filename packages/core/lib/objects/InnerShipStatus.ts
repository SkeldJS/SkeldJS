import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/util";
import { ExtractEventTypes } from "@skeldjs/events";

import {
    RpcMessageTag,
    SpawnType,
    SystemType,
    TaskLength,
    TaskType
} from "@skeldjs/constant";

import {
    BaseRpcMessage,
    CloseDoorsOfTypeMessage,
    RepairSystemMessage
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
    SystemStatus,
    AutoDoorsSystem,
} from "../systems";

import { Networkable, NetworkableEvents } from "../Networkable";
import { Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";
import { SystemStatusEvents } from "../systems/events";
import { BaseRole } from "../roles";
import { RoomAssignRolesEvent } from "../events";
import { TaskInfo } from "@skeldjs/data";

interface ConsoleDataModel {
    index: number;
    usableDistance: number;
    position: {
        x: number;
        y: number;
    };
}

interface TaskDataModel {
    index: number;
    hudText: string;
    taskType: TaskType;
    length: TaskLength;
    consoles: Record<number, ConsoleDataModel>;
}
export interface RoleAssignmentData {
    roleCtr: typeof BaseRole;
    chance: number;
    count: number;
}

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

type AllSystems = Map<SystemType, SystemStatus<any, any>>;

export interface ShipStatusData {
    systems: AllSystems;
}

export type ShipStatusEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> &
    DoorsSystemEvents<RoomType> &
    SystemStatusEvents<RoomType> &
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
    ExtractEventTypes<[ RoomAssignRolesEvent<RoomType> ]>;

export type ShipStatusType =
    | SpawnType.SkeldShipStatus
    | SpawnType.MiraShipStatus
    | SpawnType.Polus
    | SpawnType.AprilShipStatus
    | SpawnType.Airship;

export abstract class InnerShipStatus<RoomType extends Hostable = Hostable> extends Networkable<
    ShipStatusData,
    ShipStatusEvents<RoomType>,
    RoomType
> {
    static roomDoors: Partial<Record<SystemType, number[]>>;

    systems!: AllSystems;
    spawnRadius: number;
    initialSpawnCenter: Vector2;
    meetingSpawnCenter: Vector2;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | ShipStatusData
    ) {
        super(room, spawnType, netId, ownerid, flags, data);

        if (!this.systems) {
            this.systems = new Map;
            this.Setup();
        }

        this.spawnRadius = 1.55;
        this.initialSpawnCenter = Vector2.null;
        this.meetingSpawnCenter = Vector2.null;
    }

    get owner() {
        return super.owner as RoomType;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Setup() {}

    Deserialize(reader: HazelReader, spawn: boolean = false) {
        if (!this.systems) {
            this.systems = new Map;
            this.Setup();
        }

        while (reader.left) {
            const [tag, mreader] = reader.message();
            const system = this.systems.get(tag) as SystemStatus;

            if (system) {
                system.Deserialize(mreader, spawn);
            }
        }
    }

    /* eslint-disable-next-line */
    Serialize(writer: HazelWriter, spawn: boolean = false) {
        for (const [, system ] of this.systems) {
            if (system.dirty || spawn) {
                writer.begin(system.systemType);
                system.Serialize(writer, spawn);
                writer.end();
                system.dirty = false;
            }
        }
        this.dirtyBit = 0;
        return true;
    }

    async HandleRpc(rpc: BaseRpcMessage) {
        switch (rpc.messageTag) {
            case RpcMessageTag.CloseDoorsOfType:
                await this._handleCloseDoorsOfType(rpc as CloseDoorsOfTypeMessage);
                break;
            case RpcMessageTag.RepairSystem:
                await this._handleRepairSystem(rpc as RepairSystemMessage);
                break;
        }
    }

    protected async _handleCloseDoorsOfType(rpc: CloseDoorsOfTypeMessage) {
        const doors = this.systems.get(SystemType.Doors)! as DoorsSystem|AutoDoorsSystem;
        const doorsInRoom = this.getDoorsInRoom(rpc.systemId);

        if ("cooldowns" in doors) {
            doors.cooldowns.set(rpc.systemId, 30);
        }
        for (const doorId of doorsInRoom) {
            doors.closeDoor(doorId);
        }
    }

    FixedUpdate(delta: number) {
        for (const [, system ] of this.systems) {
            system.Detoriorate(delta);
        }
    }

    protected async _handleRepairSystem(rpc: RepairSystemMessage) {
        const system = this.systems.get(rpc.systemId) as SystemStatus;
        const player = this.room.getPlayerByNetId(rpc.netId);

        if (system && player) {
            await system.HandleRepair(player, rpc.amount, rpc);
        }
    }

    protected addTasksFromList(start: number, count: number, tasks: number[], usedTaskTypes: Set<TaskType>, unusedTasks: TaskInfo[]) {
        if (unusedTasks.length === 0) {
            return start;
        }

        let numLoops = 0; // fun fact: nodepolus calls this a "sanity check"
        let i = 0;
        while (i < count && numLoops++ < 1000) {
            if (start >= unusedTasks.length) {
                start = 0;
                shuffleArray(unusedTasks);
                if (unusedTasks.every(taskData => usedTaskTypes.has(taskData.taskType))) {
                    usedTaskTypes.clear();
                }
            }

            const task = unusedTasks[start++];

            if (usedTaskTypes.has(task.taskType)) {
                i--;
            } else {
                usedTaskTypes.add(task.taskType);
                tasks.push(task.index);
            }

            i++;
        }

        return start;
    }

    /**
     * Randomly assign tasks to all players, using data from @skeldjs/data.
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
                case TaskLength.Common:
                    allCommon.push(allTasks[i]);
                    break;
                case TaskLength.Long:
                    allLong.push(allTasks[i]);
                    break;
                case TaskLength.Short:
                    allShort.push(allTasks[i]);
                    break;
            }
        }

        shuffleArray(allCommon);
        shuffleArray(allLong);
        shuffleArray(allShort);

        const usedTaskTypes: Set<TaskType> = new Set;
        const commonTasks: number [] = [];

        this.addTasksFromList(0, numCommon, commonTasks, usedTaskTypes, allCommon);

        let shortIdx = 0;
        let longIdx = 0;
        for (const [ , player ] of this.room.players) {
            if (!player.playerInfo)
                continue;

            usedTaskTypes.clear();
            const playerTasks: number[] = [...commonTasks];

            shortIdx = this.addTasksFromList(shortIdx, numShort, playerTasks, usedTaskTypes, allShort);
            longIdx = this.addTasksFromList(longIdx, numLong, playerTasks, usedTaskTypes, allLong);

            await player.playerInfo.setTaskIds(playerTasks);
        }
    }

    /**
     * Get the spawn position of a player whether they are about to spawn after
     * starting or whether they are about to spawn after a meeting.
     * @param player The player or player ID to determine the position of.
     * @param initialSpawn Whther or not this is a spawn after starting the game.
     * @returns The spawn position of the player.
     */
    getSpawnPosition(player: PlayerData|number, initialSpawn: boolean) {
        const playerId = typeof player === "number"
            ? player
            : player.playerId!;

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
     * {@link InnerShipStatus.getSpawnPosition}.
     * @param player The player to determine the position of.
     * @param initialSpawn Whether or not this is a spawn after starting the game.
     * @param broadcast Whether or not to broadcast the updates.
     */
    spawnPlayer(player: PlayerData, initialSpawn: boolean, broadcast: boolean) {
        if (player.playerId === undefined)
            return;

        const spawnPosition = this.getSpawnPosition(player, initialSpawn);
        player.transform?.snapTo(spawnPosition, broadcast);
    }

    /**
     * Get all tasks for this map.
     * @returns A list of tasks for this map.
     */
    abstract getTasks(): TaskInfo[];

    /**
     * Get the door IDs used to connect to a room.
     * @param room The room to get the door IDs for.
     * @returns The door IDs that connect to the room.
     */
    abstract getDoorsInRoom(room: SystemType): number[];
}
