import { RoleTeamType, RoleType } from "@skeldjs/au-constants";
import { StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class DetectiveRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.Detective,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false,
        tasksCountTowardsProgress: true,
    };

    /**
     * How many suspects have been inspected this game.
     */
    inspectedCount: number = 0;

    /**
     * Use the detective ability to inspect a player.
     * Returns information about whether the target has committed murders.
     */
    onAbilityUse(target?: Player<RoomType>): boolean {
        if (target && target !== this.player) {
            this.inspectedCount++;
            this.isActive = true;
            return true;
        }
        return false;
    }
}
