import { GameOverReason } from "@skeldjs/constant";
import { BasicEvent } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when a game ends.
 */
export class RoomGameEndEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent {
    static eventName = "room.gameend" as const;
    eventName = "room.gameend" as const;

    constructor(
        public readonly room: RoomType,
        /**
         * The reason for why the game ended.
         */
        public readonly reason: GameOverReason
    ) {
        super();
    }
}
