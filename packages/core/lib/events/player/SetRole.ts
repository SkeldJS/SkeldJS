import { CancelableEvent } from "@skeldjs/events";
import { SetRoleMessage } from "@skeldjs/au-protocol";

import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { BaseRole } from "../../roles";

/**
 * Emitted when a player has their player role updated.
 */
export class PlayerSetRoleEvent<RoomType extends StatefulRoom> extends CancelableEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.setrole" as const;
    eventName = "player.setrole" as const;

    private _alteredRole: typeof BaseRole;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: SetRoleMessage | undefined,
        /**
         * The role that the player had before, if any.
         */
        public readonly oldRole: typeof BaseRole | undefined,
        /**
         * The new role that the player has, if any.
         */
        public readonly newRole: typeof BaseRole
    ) {
        super();

        this._alteredRole = newRole;
    }

    /**
     * The altered role that the player will have set instead, if changed.
     */
    get alteredRole() {
        return this._alteredRole;
    }

    /**
     * Change the role that the player had set, or completely remove it altogether.
     * @param role The role to set.
     */
    setRole(roleCtr: typeof BaseRole) {
        this._alteredRole = roleCtr;
    }
}
