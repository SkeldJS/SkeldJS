import { BasicEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when an impostor's murder attempt fails.
 *
 * Reasons for failure include:
 * - "protected": The target was protected by a Guardian Angel.
 * - "already_dead": The target is already dead.
 * - "invalid_target": The target is not a valid murder target.
 * - "cooldown": The killer's kill cooldown is not ready.
 * - "not_impostor": The killer does not have the Impostor role.
 */
export class PlayerMurderFailEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType> {
    static eventName = "player.murderfail" as const;
    eventName = "player.murderfail" as const;

    constructor(
        public readonly room: RoomType,
        /**
         * The player who attempted the murder.
         */
        public readonly player: Player<RoomType>,
        /**
         * The intended victim.
         */
        public readonly victim: Player<RoomType>,
        /**
         * Why the murder attempt failed.
         */
        public readonly reason: "protected" | "already_dead" | "invalid_target" | "cooldown" | "not_impostor" | string,
        /**
         * Optional additional details about the failure.
         */
        public readonly details?: string,
    ) {
        super();
    }
}
