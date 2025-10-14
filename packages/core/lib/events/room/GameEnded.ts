import { BasicEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when a game ends.
 *
 * See {@link RoomEndGameIntentEvent} to cancel or listen
 * for before a game is ended.
 */
export class RoomGameEndedEvent<RoomType extends StatefulRoom> extends BasicEvent implements RoomEvent<RoomType> {
    static eventName = "room.gameended" as const;
    eventName = "room.gameended" as const;

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
