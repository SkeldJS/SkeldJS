import { CancelableEvent } from "@skeldjs/events";
import { BaseGameDataMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";

import { RoomEvent } from "../RoomEvent";

export class RoomFixedUpdateEvent extends CancelableEvent implements RoomEvent {
    static eventName = "room.fixedupdate" as const;
    eventName = "room.fixedupdate" as const;

    constructor(
        public readonly room: Hostable,
        public readonly stream: BaseGameDataMessage[]
    ) {
        super();
    }
}
