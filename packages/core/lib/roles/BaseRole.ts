import { RoleTeamType, RoleType } from "@skeldjs/au-constants";
import { StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";

export interface RoleMetadata {
    roleType: RoleType;
    roleTeam: RoleTeamType;
    isGhostRole: boolean;
    tasksCountTowardsProgress: boolean;
}

export class BaseRole<RoomType extends StatefulRoom> {
    static roleMetadata: RoleMetadata;

    /**
     * Whether this role's special ability is currently active.
     */
    isActive: boolean = false;

    constructor(public readonly player: Player<RoomType>) { }

    /**
     * Called when the role is first assigned to the player.
     * Override to set up initial state.
     */
    onInitialize(): any {
        return;
    }

    /**
     * Called when the player with this role completes a task.
     * @param taskIdx The index of the completed task.
     */
    onTaskComplete(taskIdx: number): void {
        void taskIdx;
    }

    /**
     * Called when the player with this role kills another player.
     * Return false to prevent the normal kill behavior.
     * @param victim The player being killed.
     */
    onKill(victim: Player<RoomType>): boolean {
        void victim;
        return true; // Allow normal kill behavior
    }

    /**
     * Called when the player with this role dies.
     * Return false to prevent normal death behavior (e.g., Phantom).
     */
    onDeath(): boolean {
        return true; // Allow normal death behavior
    }

    /**
     * Called when the player uses their role's special ability.
     * @param target Optional target player for targeted abilities.
     * @returns Whether the ability was successfully used.
     */
    onAbilityUse(target?: Player<RoomType>): boolean {
        void target;
        return false;
    }

    /**
     * Called when a meeting starts.
     */
    onMeetingStart(): void {}

    /**
     * Called when the game ends.
     */
    onGameEnd(): void {}
}
