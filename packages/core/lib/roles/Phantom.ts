import { RoleTeamType, RoleType } from "@skeldjs/au-constants";
import { StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class PhantomRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.Phantom,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false,
        tasksCountTowardsProgress: false,
    };

    /**
     * Whether the phantom is currently in the vanished (invisible) state.
     */
    isVanished: boolean = false;

    /**
     * When the phantom is killed, instead of dying immediately, they enter
     * a vanished state where they can continue moving invisibly for a
     * limited duration. After the duration expires, they properly die.
     */
    onDeath(): boolean {
        if (this.isActive && !this.isVanished) {
            this.isVanished = true;
            return false; // Prevent normal death — enter vanished state
        }
        return true; // Allow normal death if already vanished or inactive
    }
}
