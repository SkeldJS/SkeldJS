import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/util";

import {
    GameMap,
    RpcMessageTag,
    SpawnType,
    SystemType,
    TaskLength,
    TaskType
} from "@skeldjs/constant";

import {
    AirshipTasks,
    MiraHQTasks,
    PolusTasks,
    TheSkeldTasks
} from "@skeldjs/data";

import { ExtractEventTypes } from "@skeldjs/events";
import { BaseRpcMessage,CloseDoorsOfTypeMessage,RepairSystemMessage } from "@skeldjs/protocol";

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
} from "../systems";

import { Networkable, NetworkableEvents } from "../Networkable";
import { Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";
import { SystemStatusEvents } from "../systems/events";
import { RoomSelectImpostorsEvent } from "../events";
import { TaskState } from "../misc/PlayerInfo";

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
    ExtractEventTypes<[ RoomSelectImpostorsEvent<RoomType> ]>;

export type ShipStatusType =
    | SpawnType.ShipStatus
    | SpawnType.Headquarters
    | SpawnType.PlanetMap
    | SpawnType.AprilShipStatus
    | SpawnType.Airship;

export class InnerShipStatus<RoomType extends Hostable = Hostable> extends Networkable<
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
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | ShipStatusData
    ) {
        super(room, spawnType, netid, ownerid, flags, data);

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
            if (system.dirty) {
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
        const doors = this.systems.get(SystemType.Doors)! as DoorsSystem;
        const doorsInRoom = this.getDoorsInRoom(rpc.systemId);

        for (const doorId of doorsInRoom) {
            doors.closeDoor(doorId);
        }
    }

    FixedUpdate(delta: number) {
        for (const [, system ] of this.systems) {
            system.Detoriorate(delta);
        }
    }

    private async _handleRepairSystem(rpc: RepairSystemMessage) {
        const system = this.systems.get(rpc.systemId) as SystemStatus;
        const player = this.room.getPlayerByNetId(rpc.netId);

        if (system && player) {
            await system.HandleRepair(player, rpc.amount, rpc);
        }
    }

    /**
     * Randomly select players to be the Impostor. Called after a game is started
     * and emits a {@link RoomSelectImpostorsEvent} which can be used to alter the
     * results of this function.
     */
    async selectImpostors() {
        const available = [...this.room.players.values()].filter(
            (player) =>
                player.info && !player.info.isDisconnected && !player.info.isDead
        );
        const max = available.length < 7 ? 1 : available.length < 9 ? 2 : 3;
        const impostors: PlayerData[] = [];

        for (
            let i = 0;
            i < Math.min(this.room.settings.numImpostors, max);
            i++
        ) {
            const random = ~~(Math.random() * available.length);
            impostors.push(available[random]);
            available.splice(random, 1);
        }

        const ev = await this.emit(
            new RoomSelectImpostorsEvent(
                this.room,
                impostors
            )
        );

        if (!ev.canceled && this.room.host?.control) {
            await this.room.host.control.setImpostors(ev.alteredImpostors);
        }
    }

    private getTasksForMap(map: number) {
        switch (map) {
            case GameMap.TheSkeld:
                return Object.values(TheSkeldTasks);
            case GameMap.MiraHQ:
                return Object.values(MiraHQTasks);
            case GameMap.Polus:
                return Object.values(PolusTasks);
            case GameMap.AprilFoolsTheSkeld:
                return Object.values(TheSkeldTasks);
            case GameMap.Airship:
                return Object.values(AirshipTasks);
        }
        return [];
    }

    private addTasksFromList(start: number, count: number, tasks: number[], usedTaskTypes: Set<TaskType>, unusedTasks: TaskDataModel[]) {
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

    async assignTasks() {
        const allTasks = this.getTasksForMap(this.room.settings.map);
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
            if (!player.info)
                continue;

            usedTaskTypes.clear();
            const playerTasks: number[] = [...commonTasks];

            shortIdx = this.addTasksFromList(shortIdx, numShort, playerTasks, usedTaskTypes, allShort);
            longIdx = this.addTasksFromList(longIdx, numLong, playerTasks, usedTaskTypes, allLong);

            player.info.setTaskIds(playerTasks);
            player.info.setTaskStates(playerTasks.map((task, taskIdx) => {
                return new TaskState(taskIdx, false);
            }));
        }
    }

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

    spawnPlayer(player: PlayerData, initialSpawn: boolean) {
        if (player.playerId === undefined)
            return;

        player.transform?.snapTo(this.getSpawnPosition(player, initialSpawn));
    }

    getDoorsInRoom(room: SystemType): number[] {
        void room;
        return [];
    }
}
