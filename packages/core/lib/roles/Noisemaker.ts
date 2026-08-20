import { RoleTeamType, RoleType } from "@skeldjs/au-constants";
import { StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class NoisemakerRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.Noisemaker,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false,
        tasksCountTowardsProgress: true,
    };

    /**
     * When the noisemaker completes a task, they emit an alert revealing
     * their position to nearby players. Impostors may also see the alert
     * depending on game settings.
     */
    onTaskComplete(taskIdx: number): void {
        void taskIdx;
        this.isActive = true;
        // The actual alert emission is handled by the game manager
        // which reads the room settings for alert duration and impostor visibility
    }
}
