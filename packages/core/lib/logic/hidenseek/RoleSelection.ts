import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { GameLogicComponent } from "../GameLogicComponent";
import { PlayerData } from "../../PlayerData";
import { BaseRole, CrewmateRole, EngineerRole, ImpostorRole } from "../../roles";
import { RoomAssignRolesEvent } from "../../events";
import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { RoleChanceSettings } from "@skeldjs/protocol";

export type HideNSeekRoleSelectionLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekRoleSelectionLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<HideNSeekRoleSelectionLogicComponentEvents, RoomType> {
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

    getRoleAssignmentsForTeam(
        playerPool: PlayerData[],
        settings: Partial<Record<RoleType, RoleChanceSettings>>,
        roleTeam: RoleTeamType,
        maxAssignable: number,
        defaultRole?: typeof BaseRole,
        roleAssignments: Map<PlayerData, typeof BaseRole> = new Map
    ) {
        if (roleTeam === RoleTeamType.Crewmate) {
            return new Array(playerPool.length).fill(EngineerRole);
        } else {
            // todo: role assignments
            return [];
        }
    }

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
    
    async assignRolesFromAssignments(roleAssignments: Map<PlayerData, typeof BaseRole>) {
        const promises = [];
        for (const [ player, roleCtr ] of roleAssignments) {
            promises.push(player.control?.setRole(roleCtr));
        }
        await Promise.all(promises);
    }
}
