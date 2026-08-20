import { RoleTeamType, RoleType } from "@skeldjs/au-constants";
import { StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class ViperRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.Viper,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false,
        tasksCountTowardsProgress: false,
    };

    /**
     * When the viper kills, the target doesn't die immediately.
     * Instead, they become "poisoned" and die after a dissolve delay.
     * This creates an alibi window for the viper.
     */
    onKill(victim: Player<RoomType>): boolean {
        void victim;
        // The viper applies poison instead of killing immediately.
        // The actual delayed death is handled by the game manager
        // using the viperDissolveTime setting.
        this.isActive = true;
        return false; // Prevent normal instant kill
    }
}
