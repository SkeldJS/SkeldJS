import { BasicEvent } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when a game ends.
 *
 * See {@link RoomEndGameIntentEvent} to cancel or listen
 * for before a game is ended.
 */
export class RoomGameEndEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent {
    static eventName = "room.gameend" as const;
    eventName = "room.gameend" as const;

    constructor(
        public readonly room: RoomType,
        /**
         * The reason for why the game ended. See {@link GameOverReason}
         */
        public readonly reason: number
    ) {
        super();
    }
}
