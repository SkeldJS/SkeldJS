import { CancelableEvent } from "@skeldjs/events";
import { BaseGameDataMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";

import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when the room completes a fixed update cycle. (Every 20ms)
 */
export class RoomFixedUpdateEvent extends CancelableEvent implements RoomEvent {
    static eventName = "room.fixedupdate" as const;
    eventName = "room.fixedupdate" as const;

    constructor(
        public readonly room: Hostable,
        /**
         * The game data stream that the room will broadcast.
         */
        public readonly stream: BaseGameDataMessage[]
    ) {
        super();
    }
}
