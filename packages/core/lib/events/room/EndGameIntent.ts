import { CancelableEvent } from "@skeldjs/events";
import { GameOverReason } from "@skeldjs/constant";
import { StatefulRoom } from "../../StatefulRoom";

/**
 * Emitted when a game end intent critera is fulfilled, and the game is planned
 * to end.
 *
 * Useful for canceling typical end game scenarios. See {@link RoomGameEndEvent}
 * to listen for an actual game end, and see {@link StatefulRoom.registerEndGameIntent}
 * to register your own end game intent.
 */
export class RoomEndGameIntentEvent<RoomType extends StatefulRoom> extends CancelableEvent {
    static eventName = "room.endgameintent" as const;
    eventName = "room.endgameintent" as const;

    constructor(
        public readonly room: RoomType,
        public readonly intentName: string,
        public readonly reason: GameOverReason,
        public readonly metadata: any
    ) {
        super();
    }
}
