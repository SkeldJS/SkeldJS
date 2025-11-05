import { EventMapFromList } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";
import { Player } from "../../Player";
import { BaseRole, CrewmateGhostRole, CrewmateRole, EngineerRole, ImpostorGhostRole, ImpostorRole } from "../../roles";
import { RoomAssignRolesEvent } from "../../events";
import { RoleTeamType, RoleType } from "@skeldjs/au-constants";
import { BaseSystemMessage, BaseRpcMessage, RoleChanceSettings } from "@skeldjs/au-protocol";
import { HazelWriter, HazelReader } from "@skeldjs/hazel";
import { HideAndSeekManager, PlayerControl } from "../../objects";

export type HideNSeekRoleSelectionLogicComponentEvents = EventMapFromList<[]>;

export class HideNSeekRoleSelectionLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<HideNSeekRoleSelectionLogicComponentEvents, RoomType> {
    parseData(reader: HazelReader): BaseSystemMessage | undefined {
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        void data;
    }

    createData(): BaseSystemMessage | undefined {
        return undefined;
    }
    
    async processFixedUpdate(deltaTime: number): Promise<void> {
        void deltaTime;
    }

    async onGameStart(): Promise<void> {
        await this.assignRoles();
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
        defaultRole: typeof BaseRole,
        roleAssignments: Map<Player<RoomType>, typeof BaseRole>
    ) {
        if (roleTeam === RoleTeamType.Crewmate) {
            for (let i = playerPool.length - 1; i >= 0; i--) {
                const player = playerPool[i];
                roleAssignments.set(player, defaultRole);
                playerPool.splice(i, 1);
            }
        } else {
            const seekerPlayerId = this.manager.room.settings.seekerPlayerId;
            if (seekerPlayerId > -1 && this.manager.room.getSelectedSeekerAllowedImpl(seekerPlayerId)) {
                for (let i = 0; i < playerPool.length; i++) {
                    const player = playerPool[i];
                    if (player.getPlayerId() === seekerPlayerId) {
                        roleAssignments.set(player, defaultRole);
                        playerPool.splice(i, 1);
                        return;
                    }
                }
            }

            var num = 0;
            while (num < maxAssignable && playerPool.length > 0) {
                const randomPlayerIdx = Math.floor(Math.random() * playerPool.length);
                const randomPlayer = playerPool[randomPlayerIdx];
                roleAssignments.set(randomPlayer, defaultRole);
                playerPool.splice(randomPlayerIdx, 1);
                num += 1;
            }
        }
    }

    async assignRoles() {
        const manager = this.manager as HideAndSeekManager<RoomType>;
        const allPlayers = [];
        for (const [, player] of this.manager.room.players) {
            const playerInfo = player.getPlayerInfo();
            if (playerInfo && !playerInfo?.isDisconnected && !playerInfo?.isDead) {
                allPlayers.push(player);
            }
        }

        const roleAssignments: Map<Player<RoomType>, typeof BaseRole> = new Map;
        
        console.log(allPlayers, roleAssignments);

        const numSeekers = manager.options.getAdjustedNumImpostors(allPlayers.length);
        this.getRoleAssignmentsForTeam(allPlayers, this.manager.room.settings.roleSettings.roleChances, RoleTeamType.Impostor, Math.min(numSeekers, this.manager.room.settings.numImpostors), ImpostorRole, roleAssignments);
        this.getRoleAssignmentsForTeam(allPlayers, this.manager.room.settings.roleSettings.roleChances, RoleTeamType.Crewmate, 2 ** 31 - 1, EngineerRole, roleAssignments);

        console.log(allPlayers, roleAssignments);

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
    
    async onPlayerDeath(playerControl: PlayerControl<RoomType>, assignGhostRole: boolean): Promise<void> {
        if (assignGhostRole) {
            const playerInfo = playerControl.getPlayerInfo();
            if (!playerInfo) return;

            if (playerInfo.isImpostor) {
                await playerControl.setRole(ImpostorGhostRole);
            } else {
                await playerControl.setRole(CrewmateGhostRole);
            }
        }
    }
}
