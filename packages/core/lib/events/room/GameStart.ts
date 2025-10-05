import { BasicEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when a game is started.
 */
export class RoomGameStartEvent<RoomType extends StatefulRoom> extends BasicEvent implements RoomEvent<RoomType> {
    static eventName = "room.gamestart" as const;
    eventName = "room.gamestart" as const;

    constructor(
        public readonly room: RoomType
    ) {
        super();
    }
}
