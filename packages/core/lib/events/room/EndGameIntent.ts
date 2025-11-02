import { CancelableEvent } from "@skeldjs/events";
import { GameOverReason } from "@skeldjs/au-constants";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";
import { EndGameIntent } from "../../EndGameIntent";

/**
 * Emitted when a game end intent critera is fulfilled, and the game is planned
 * to end.
 *
 * Useful for canceling typical end game scenarios. See {@link RoomGameEndEvent}
 * to listen for an actual game end, and see {@link StatefulRoom.registerEndGameIntent}
 * to register your own end game intent.
 */
export class RoomEndGameIntentEvent<RoomType extends StatefulRoom> extends CancelableEvent implements RoomEvent<RoomType> {
    static eventName = "room.endgameintent" as const;
    eventName = "room.endgameintent" as const;

    constructor(
        public readonly room: RoomType,
        public readonly intent: EndGameIntent,
    ) {
        super();
    }
}
