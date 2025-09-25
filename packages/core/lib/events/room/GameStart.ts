import { BasicEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when a game is started.
 */
export class RoomGameStartEvent<RoomType extends StatefulRoom = StatefulRoom> extends BasicEvent implements RoomEvent {
    static eventName = "room.gamestart" as const;
    eventName = "room.gamestart" as const;

    constructor(
        public readonly room: RoomType
    ) {
        super();
    }
}
