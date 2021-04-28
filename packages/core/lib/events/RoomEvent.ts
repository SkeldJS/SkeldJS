import { CancelableEvent } from "@skeldjs/events";

import { Hostable } from "../Hostable";

export class RoomEvent extends CancelableEvent {
    /**
     * The room or client that the event came from.
     */
    room: Hostable;

    constructor(room: Hostable<any>) {
        super();

        this.room = room;
    }
}
