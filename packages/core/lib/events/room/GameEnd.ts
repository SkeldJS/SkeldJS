import { GameOverReason } from "@skeldjs/constant";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when a game in the room ends.
 */
export class RoomGameEndEvent extends RoomEvent {
    static eventName = "room.game.end" as const;
    eventName = "room.game.end" as const;

    /**
     * The reason for why the game ended.
     */
    reason: GameOverReason;

    constructor(room: Hostable<any>, reason: GameOverReason) {
        super(room);

        this.reason = reason;
    }
}
