import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/util";
import { ExtractEventTypes } from "@skeldjs/events";

import {
    RoleTeamType,
    RoleType,
    RpcMessageTag,
    SpawnType,
    SystemType,
    TaskLength,
    TaskType
} from "@skeldjs/constant";

import {
    BaseRpcMessage,
    CloseDoorsOfTypeMessage,
    RepairSystemMessage,
    RoleChanceSettings
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
    SystemStatusEvents
} from "../systems";

import { Networkable, NetworkableEvents } from "../Networkable";
import { Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";

import { BaseRole, CrewmateRole, ImpostorRole } from "../roles";
import { RoomAssignRolesEvent } from "../events";
import { TaskState } from "../misc";
import { TaskInfo } from "@skeldjs/data";

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

    protected async _handleRepairSystem(rpc: RepairSystemMessage) {
        const system = this.systems.get(rpc.systemId) as SystemStatus;
        const player = this.room.getPlayerByNetId(rpc.netId);

        if (system && player) {
            await system.HandleRepair(player, rpc.amount, rpc);
        }
    }

    /**
     * Get all roles registered on the room that match a given filter.
     * @param filter The filter to match against.
     * @returns A list of all roles that satisfy the given filter.
     */
    matchRoles(settings: Partial<Record<RoleType, RoleChanceSettings>>, filter: (roleCtr: typeof BaseRole, roleChance: RoleChanceSettings) => any) {
        const filteredRoles = [];
        for (const [ , roleCtr ] of this.room.registeredRoles) {
            const roleChance = settings[roleCtr.roleMetadata.roleType as RoleType];
            if (roleChance && filter(roleCtr, roleChance)) {
                filteredRoles.push(roleCtr);
            }
        }
        return filteredRoles;
    }

    /**
     * Specifically assign a pool of players to each role in a specific team.
     * @param playerPool The entire list of players that can be assigned a role,
     * whether or not they already have a role. Note that this is _not_ a list
     * of players to be assigned a role from this team, but it is instead every possible
     * player who _could_ be assigned one.
     * @param settings Role settings to use when calculating how many players
     * should assigned a specific role.
     * @param roleTeam The team of roles to assign.
     * @param maxAssignable The maximum number of players that can be assigned
     * a role from this team. For example, it could be the set number of impostors
     * configured in the game settings.
     * @param defaultRole The default role to assign to each player
     * @param roleAssignments A map of role assigments (i.e. a map of player to
     * roles) to act as a collective output to this method.
     * @returns The role assignments (i.e. a map of player to roles) that have
     * either collectively been assigned (if roleAssignments is passed)
     * or been assigned just as part of this method.
     */
    getRoleAssignmentsForTeam(
        playerPool: PlayerData[],
        settings: Partial<Record<RoleType, RoleChanceSettings>>,
        roleTeam: RoleTeamType,
        maxAssignable: number,
        defaultRole?: typeof BaseRole,
        roleAssignments: Map<PlayerData, typeof BaseRole> = new Map
    ) {
        const teamRoles = this.matchRoles(settings, roleCtr =>
            roleCtr.roleMetadata.roleTeam === roleTeam && !roleCtr.roleMetadata.isGhostRole);

        return this.getRoleAssignmentsFromRoleList(playerPool, settings, teamRoles, maxAssignable, defaultRole, roleAssignments);
    }

    /**
     * Specifically assign a pool of players to each role in a list, with regard
     * to the room settings (i.e. the chance of each role appearing or the maximum
     * number of assignments for the role).
     * @param playerPool The entire list of players that can be assigned a role,
     * whether or not they already have a role. Note that this is _not_ a list
     * of players to be assigned a role from this team, but it is instead every possible
     * player who _could_ be assigned one.
     * @param settings Role settings to use when calculating how many players
     * should assigned a specific role.
     * @param roleTeam The team of roles to assign.
     * @param maxAssignable The maximum number of players that can be assigned
     * a role from this team. For example, it could be the set number of impostors
     * configured in the game settings.
     * @param defaultRole The default role to assign to each player
     * @param roleAssignments A map of role assigments (i.e. a map of player to
     * roles) to act as a collective output to this method.
     * @returns The role assignments (i.e. a map of player to roles) that have
     * either collectively been assigned (if roleAssignments is passed)
     * or been assigned just as part of this method.
     */
    getRoleAssignmentsFromRoleList(
        playerPool: PlayerData[],
        settings: Partial<Record<RoleType, RoleChanceSettings>>,
        teamRoles: typeof BaseRole[],
        maxAssignable: number,
        defaultRole?: typeof BaseRole,
        roleAssignments: Map<PlayerData, typeof BaseRole> = new Map
    ) {
        const roleAssignmentData: RoleAssignmentData[] = [];
        for (let i = 0; i < teamRoles.length; i++) {
            const roleCtr = teamRoles[i];
            roleAssignmentData.push({
                roleCtr,
                chance: settings[roleCtr.roleMetadata.roleType as RoleType]!.chance,
                count: settings[roleCtr.roleMetadata.roleType as RoleType]!.maxPlayers
            });
        }

        const fullChanceRoles: typeof BaseRole[] = [];
        const lesserChanceRoles: typeof BaseRole[] = [];

        for (const roleAssignment of roleAssignmentData) {
            if (roleAssignment.chance >= 100) {
                for (let i = 0; i < roleAssignment.count; i++) {
                    fullChanceRoles.push(roleAssignment.roleCtr);
                    roleAssignment.count--;
                }
            } else if (roleAssignment.chance > 0) {
                for (let i = 0; i < roleAssignment.count; i++) {
                    if (Math.random() * 101 < roleAssignment.chance) {
                        lesserChanceRoles.push(roleAssignment.roleCtr);
                    }
                }
            }
        }

        this.getRoleAssignmentsForPlayers(playerPool, maxAssignable, fullChanceRoles, roleAssignments);
        this.getRoleAssignmentsForPlayers(playerPool, maxAssignable, lesserChanceRoles, roleAssignments);

        if (defaultRole) {
            const defaultRoles: typeof BaseRole[] = [];
            const num = Math.min(playerPool.length, maxAssignable);
            for (let i = 0; i < num; i++) {
                defaultRoles.push(defaultRole);
            }
            this.getRoleAssignmentsForPlayers(playerPool, maxAssignable, defaultRoles, roleAssignments);
        }

        return roleAssignments;
    }

    /**
     * Assign a list of roles to a pool of players, eliminating both players
     * from the player list and also roles from the role list, and without regard
     * for room settings (i.e. the chances of each role appearing or the maximum
     * number of assignments for the role).
     * @param playerPool The pool of players to assign a list of roles to.
     * @param maxAssignable The maximum number of players that cn be assigned a
     * role from this list.
     * @param roleList The list of roles to assign to players.
     * @param roleAssignments A map of role assigments (i.e. a map of player to
     * roles) to act as a collective output to this method.
     * @returns The role assignments (i.e. a map of player to roles) that have
     * either collectively been assigned (if roleAssignments is passed)
     * or been assigned just as part of this method.
     */
    getRoleAssignmentsForPlayers(playerPool: PlayerData[], maxAssignable: number, roleList: typeof BaseRole[], roleAssignments: Map<PlayerData, typeof BaseRole> = new Map) {
        let numAssigned = 0;
        while (roleList.length > 0 && playerPool.length > 0 && numAssigned < maxAssignable) {
            const roleIdx = Math.floor(Math.random() * roleList.length);
            const roleCtr = roleList[roleIdx];
            roleList.splice(roleIdx, 1);

            const playerIdx = Math.floor(Math.random() * playerPool.length);
            const player = playerPool[playerIdx];
            playerPool.splice(playerIdx, 1);

            roleAssignments.set(player, roleCtr);
            numAssigned++;
        }
        return roleAssignments;
    }

    /**
     * Randomly assign players to each enabled role with a certain probability.
     * Called just after a game is started and emits a {@link RoomAssignRolesEvent}
     * which can be used to alter which players are assigned which roles.
     */
    async assignRoles() {
        const allPlayers = [];
        for (const [ , player ] of this.room.players) {
            if (!player.playerInfo?.isDisconnected && !player.playerInfo?.isDead) {
                allPlayers.push(player);
            }
        }

        const roleAssignments: Map<PlayerData, typeof BaseRole> = new Map;

        const adjustedImpostors = allPlayers.length < 7 ? 1 : allPlayers.length < 9 ? 2 : 3;
        const assignedImpostors = this.getRoleAssignmentsForTeam(allPlayers, this.room.settings.roleSettings.roleChances, RoleTeamType.Impostor, Math.min(adjustedImpostors, this.room.settings.numImpostors), ImpostorRole);
        const assignedCrewmates = this.getRoleAssignmentsForTeam(allPlayers, this.room.settings.roleSettings.roleChances, RoleTeamType.Crewmate, 2 ** 31 - 1, CrewmateRole);

        for (const [ player, roleCtr ] of assignedImpostors) {
            roleAssignments.set(player, roleCtr);
        }
        for (const [ player, roleCtr ] of assignedCrewmates) {
            roleAssignments.set(player, roleCtr);
        }

        const ev = await this.emit(
            new RoomAssignRolesEvent(
                this.room,
                roleAssignments
            )
        );

        if (!ev.canceled) {
            await this.assignRolesFromAssignments(ev.alteredAssignments);
        }
    }

    /**
     * Try to assign a ghost role to a specific dead player.
     * @param player The player to assign the role to.
     */
    async tryAssignGhostRole(player: PlayerData) {
        if (!player.playerInfo?.isDead || player.playerInfo.isImpostor)
            return;

        const ghostRoles = this.matchRoles(this.room.settings.roleSettings.roleChances, (roleCtr, roleChance) => {
            if (!roleCtr.roleMetadata.isGhostRole)
                return false;

            if (roleChance.chance >= 100)
                return true;

            if (Math.random() * 101 < roleChance.chance)
                return true;

            return false;
        });

        if (!ghostRoles.length)
            return;

        const randomRole = ghostRoles[Math.floor(Math.random() * ghostRoles.length)];
        await player.control?.setRole(randomRole);
    }

    /**
     * Actually set all player roles from a map of player to role assignments,
     * can be gathered from {@link InnerShipStatus.getRoleAssignmentsForTeam}.
     * @param roleAssignments A map of player to role assignments to assign to
     * every role.
     */
    async assignRolesFromAssignments(roleAssignments: Map<PlayerData, typeof BaseRole>) {
        const promises = [];
        for (const [ player, roleCtr ] of roleAssignments) {
            promises.push(player.control?.setRole(roleCtr));
        }
        await Promise.all(promises);
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
    assignTasks() {
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

            player.playerInfo.setTaskIds(playerTasks);
            player.playerInfo.setTaskStates(playerTasks.map((task, taskIdx) => {
                return new TaskState(taskIdx, false);
            }));
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
     */
    spawnPlayer(player: PlayerData, initialSpawn: boolean) {
        if (player.playerId === undefined)
            return;

        player.transform?.snapTo(this.getSpawnPosition(player, initialSpawn), false);
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
