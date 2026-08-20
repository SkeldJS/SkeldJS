import { BasicEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player's level has changed (after SetLevel RPC is processed).
 * Unlike PlayerSetLevelEvent which fires when the RPC is received,
 * this event fires after the level is actually updated on the connection.
 */
export class PlayerLevelChangedEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType> {
    static eventName = "player.levelchanged" as const;
    eventName = "player.levelchanged" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        /**
         * The player's level before the change.
         */
        public readonly oldLevel: number,
        /**
         * The player's new level.
         */
        public readonly newLevel: number,
    ) {
        super();
    }
}
