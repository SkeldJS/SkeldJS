import { BasicEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when a game is started.
 */
export class RoomGameStartedEvent<RoomType extends StatefulRoom> extends BasicEvent implements RoomEvent<RoomType> {
    static eventName = "room.gamestarted" as const;
    eventName = "room.gamestarted" as const;

    constructor(
        public readonly room: RoomType
    ) {
        super();
    }
}
