import { RevertableEvent } from "@skeldjs/events";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player's protection by a guardian angel ends, either by running
 * out of time or attempted to be murdered by an impostor.
 *
 * See {@link PlayerProtectEvent} to listen for when a player gets protected
 * initially.
 */
export class PlayerRemoveProtectionEvent<RoomType extends StatefulRoom> extends RevertableEvent implements PlayerEvent<RoomType> {
    static eventName = "player.removeprotection" as const;
    eventName = "player.removeprotection" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        /**
         * Whether or not the player ran out of protection because of a murder attempt.
         */
        public readonly murderAttempt: boolean
    ) {
        super();
    }
}
