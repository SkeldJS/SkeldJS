import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";
import { PlayerData } from "../../PlayerData";
import { BaseRole, CrewmateRole, ImpostorRole } from "../../roles";
import { RoomAssignRolesEvent } from "../../events";
import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { PlayerControl, RoleAssignmentData } from "../../objects";
import { RoleChanceSettings } from "@skeldjs/protocol";

export type NormalRoleSelectionLogicComponentEvents = ExtractEventTypes<[]>;

export class NormalRoleSelectionLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<NormalRoleSelectionLogicComponentEvents, RoomType> {
    /**
     * Get all roles registered on the room that match a given filter.
     * @param filter The filter to match against.
     * @returns A list of all roles that satisfy the given filter.
     */
    matchRoles(settings: Partial<Record<RoleType, RoleChanceSettings>>, filter: (roleCtr: typeof BaseRole, roleChance: RoleChanceSettings) => any) {
        const filteredRoles = [];
        for (const [ , roleCtr ] of this.manager.room.registeredRoles) {
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
        for (const [ , player ] of this.manager.room.players) {
            if (player.playerInfo && !player.playerInfo?.isDisconnected && !player.playerInfo?.isDead) {
                allPlayers.push(player);
            }
        }

        const roleAssignments: Map<PlayerData, typeof BaseRole> = new Map;

        const adjustedImpostors = allPlayers.length < 7 ? 1 : allPlayers.length < 9 ? 2 : 3;
        const assignedImpostors = this.getRoleAssignmentsForTeam(allPlayers, this.manager.room.settings.roleSettings.roleChances, RoleTeamType.Impostor, Math.min(adjustedImpostors, this.manager.room.settings.numImpostors), ImpostorRole);
        const assignedCrewmates = this.getRoleAssignmentsForTeam(allPlayers, this.manager.room.settings.roleSettings.roleChances, RoleTeamType.Crewmate, 2 ** 31 - 1, CrewmateRole);

        for (const [ player, roleCtr ] of assignedImpostors) {
            roleAssignments.set(player, roleCtr);
        }
        for (const [ player, roleCtr ] of assignedCrewmates) {
            roleAssignments.set(player, roleCtr);
        }
        for (const [ , playerController ] of this.manager.room.netobjects) {
            if (playerController instanceof PlayerControl && playerController.player.isFakePlayer) {
                roleAssignments.set(playerController.player, CrewmateRole);
            }
        }

        const ev = await this.emit(
            new RoomAssignRolesEvent(
                this.manager.room,
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

        const ghostRoles = this.matchRoles(this.manager.room.settings.roleSettings.roleChances, (roleCtr, roleChance) => {
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
}
