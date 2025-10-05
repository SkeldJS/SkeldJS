import { ExtractEventTypes } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";
import { Player } from "../../Player";
import { BaseRole, CrewmateRole, EngineerRole, ImpostorRole } from "../../roles";
import { RoomAssignRolesEvent } from "../../events";
import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { BaseRpcMessage, RoleChanceSettings } from "@skeldjs/protocol";
import { HazelWriter, HazelReader } from "@skeldjs/util";

export type HideNSeekRoleSelectionLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekRoleSelectionLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<HideNSeekRoleSelectionLogicComponentEvents, RoomType> {
    async processFixedUpdate(deltaTime: number): Promise<void> {
        void deltaTime;
    }

    async handleRemoteCall(rpc: BaseRpcMessage): Promise<void> {
        void rpc;
    }

    serializeToWriter(writer: HazelWriter, initialState: boolean): void {
        void writer, initialState;
    }

    deserializeFromReader(reader: HazelReader, initialState: boolean): void {
        void reader, initialState;
    }

    async onGameStart(): Promise<void> {
        void 0;
    }

    async onGameEnd(): Promise<void> {
        void 0;
    }

    async onDestroy(): Promise<void> {
        void 0;
    }

    async onPlayerDisconnect(): Promise<void> {
        void 0;
    }

    matchRoles(settings: Partial<Record<RoleType, RoleChanceSettings>>, filter: (roleCtr: typeof BaseRole, roleChance: RoleChanceSettings) => any) {
        const filteredRoles = [];
        for (const [, roleCtr] of this.manager.room.registeredRoles) {
            const roleChance = settings[roleCtr.roleMetadata.roleType as RoleType];
            if (roleChance && filter(roleCtr, roleChance)) {
                filteredRoles.push(roleCtr);
            }
        }
        return filteredRoles;
    }

    getRoleAssignmentsForTeam(
        playerPool: Player<RoomType>[],
        settings: Partial<Record<RoleType, RoleChanceSettings>>,
        roleTeam: RoleTeamType,
        maxAssignable: number,
        defaultRole?: typeof BaseRole,
        roleAssignments: Map<Player<RoomType>, typeof BaseRole> = new Map
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
        for (const [, player] of this.manager.room.players) {
            const playerInfo = player.getPlayerInfo();
            if (playerInfo && !playerInfo?.isDisconnected && !playerInfo?.isDead) {
                allPlayers.push(player);
            }
        }

        const roleAssignments: Map<Player<RoomType>, typeof BaseRole> = new Map;

        const adjustedImpostors = allPlayers.length < 7 ? 1 : allPlayers.length < 9 ? 2 : 3;
        const assignedImpostors = this.getRoleAssignmentsForTeam(allPlayers, this.manager.room.settings.roleSettings.roleChances, RoleTeamType.Impostor, Math.min(adjustedImpostors, this.manager.room.settings.numImpostors), ImpostorRole);
        const assignedCrewmates = this.getRoleAssignmentsForTeam(allPlayers, this.manager.room.settings.roleSettings.roleChances, RoleTeamType.Crewmate, 2 ** 31 - 1, CrewmateRole);

        for (const [player, roleCtr] of assignedImpostors) {
            roleAssignments.set(player, roleCtr);
        }
        for (const [player, roleCtr] of assignedCrewmates) {
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

    async assignRolesFromAssignments(roleAssignments: Map<Player<RoomType>, typeof BaseRole>) {
        const promises = [];
        for (const [player, roleCtr] of roleAssignments) {
            promises.push(player.characterControl?.setRole(roleCtr));
        }
        await Promise.all(promises);
    }
}
