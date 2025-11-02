import { BasicEvent } from "@skeldjs/events";
import { ProtectPlayerMessage } from "@skeldjs/au-protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player (who is a guardian angel) protects another player.
 *
 * Due to technical limitations, this event cannot be  reverted without advanced
 * "breaking game", therefore it is out of scope of a single `.revert()` function.
 * However, see {@link PlayerCheckProtectEvent} to see about canceling a protection
 * before it happens if you are the host.
 */
export class PlayerProtectEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.protect" as const;
    eventName = "player.protect" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: ProtectPlayerMessage | undefined,
        /**
         * The player that was protected.
         */
        public readonly target: Player<RoomType>,
        /**
         * The duration, in seconds, for how long the player is protected for.
         */
        public readonly duration: number
    ) {
        super();
    }
}
