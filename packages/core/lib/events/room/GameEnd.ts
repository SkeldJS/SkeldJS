import { GameOverReason } from "@skeldjs/constant";
import { BasicEvent } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class RoomGameEndEvent extends BasicEvent implements RoomEvent {
    static eventName = "room.gameend" as const;
    eventName = "room.gameend" as const;

    constructor(
        public readonly room: Hostable,
        public readonly reason: GameOverReason
    ) {
        super();
    }
}
