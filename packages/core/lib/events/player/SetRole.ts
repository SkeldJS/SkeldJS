import { CancelableEvent } from "@skeldjs/events";
import { SetRoleMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { BaseRole } from "../../roles";

/**
 * Emitted when a player has their player role updated.
 */
export class PlayerSetRoleEvent<RoomType extends Hostable = Hostable> extends CancelableEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setrole" as const;
    eventName = "player.setrole" as const;

    private _alteredRole: typeof BaseRole;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetRoleMessage|undefined,
        /**
         * The role that the player had before, if any.
         */
        public readonly oldRole: typeof BaseRole|undefined,
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
