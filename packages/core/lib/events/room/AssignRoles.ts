import { CancelableEvent } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { BaseRole } from "../../roles";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when SkeldJS assigns roles to each player, just after a game is started.
 * Can be canceled to avoid assigning roles entirely, or can be used to change
 * which roles are assigned to which players.
 *
 * Does not guarantee that the players' roles have actually been assigned, see
 * {@link PlayerSetRoleEvent}.
 */
export class RoomAssignRolesEvent<RoomType extends Hostable = Hostable> extends CancelableEvent implements RoomEvent {
    static eventName = "room.assignroles" as const;
    eventName = "room.assignroles" as const;

    private _alteredAssignments: Map<PlayerData<RoomType>, typeof BaseRole>;

    constructor(
        public readonly room: RoomType,
        /**
         * The players that were chosen to be impostors.
         */
        public readonly roleAssignments: Map<PlayerData<RoomType>, typeof BaseRole>
    ) {
        super();

        this._alteredAssignments = new Map(roleAssignments.entries());
    }

    /**
     * Which roles to assign to which players instead, if changed.
     */
    get alteredAssignments() {
        return this._alteredAssignments;
    }

    /**
     * Change which roles to assign to which players.
     * @param roleAssignments The roles to assign instead.
     */
    setAssignments(roleAssignments: Map<PlayerData<RoomType>, typeof BaseRole>) {
        this._alteredAssignments = roleAssignments;
    }

    /**
     * Change which role a player will get assigned.
     * @param player The player to change the assignment for.
     * @param assignment The role to assign for the player instead.
     */
    setAssignment(player: PlayerData<RoomType>, assignment: typeof BaseRole) {
        this._alteredAssignments.set(player, assignment);
    }
}
