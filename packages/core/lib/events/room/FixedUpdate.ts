import { CancelableEvent } from "@skeldjs/events";
import { BaseGameDataMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";

import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when the room completes a fixed update cycle. (Roughly 20ms)
 *
 * Note that this is called very often, and if the event takes too longer, that is,
 * too long so that the next fixed update is called before it has finished, then
 * it will cascade and eventually crash due to a memory leak.
 */
export class RoomFixedUpdateEvent<RoomType extends Hostable = Hostable>extends CancelableEvent implements RoomEvent {
    static eventName = "room.fixedupdate" as const;
    eventName = "room.fixedupdate" as const;

    constructor(
        public readonly room: RoomType,
        /**
         * The game data stream that the room will broadcast.
         */
        public readonly stream: BaseGameDataMessage[],
        /**
         * The time that has passed since the last fixed update call, in seconds.
         */
        public readonly delta: number
    ) {
        super();
    }
}
