import { RoleTeamType, RoleType } from "@skeldjs/au-constants";
import { StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class TrackerRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.Tracker,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false,
        tasksCountTowardsProgress: true,
    };

    /**
     * The player currently being tracked, if any.
     */
    trackedTarget: Player<RoomType> | null = null;

    /**
     * How long tracking has been active (in seconds).
     */
    trackingElapsed: number = 0;

    /**
     * Use the tracking ability to mark a target player and receive
     * periodic position updates (arrow indicators).
     */
    onAbilityUse(target?: Player<RoomType>): boolean {
        if (target && target !== this.player) {
            this.trackedTarget = target;
            this.trackingElapsed = 0;
            this.isActive = true;
            return true;
        }
        return false;
    }
}
