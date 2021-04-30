import { BaseGameDataMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted before a Fixed Update stream is sent to the server.
 */
export class RoomFixedUpdateEvent extends RoomEvent {
    static eventName = "room.fixedupdate" as const;
    eventName = "room.fixedupdate" as const;

    /**
     * Array of messages that will be sent to the server.
     */
    stream: BaseGameDataMessage[];

    constructor(room: Hostable<any>, stream: BaseGameDataMessage[]) {
        super(room);

        this.stream = stream;
    }
}
