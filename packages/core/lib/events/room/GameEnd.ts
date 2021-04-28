import { GameOverReason } from "@skeldjs/constant";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class RoomGameEndEvent extends RoomEvent {
    static eventName = "room.game.end" as const;
    eventName = "room.game.end" as const;

    reason: GameOverReason;

    constructor(room: Hostable<any>, reason: GameOverReason) {
        super(room);

        this.reason = reason;
    }
}
