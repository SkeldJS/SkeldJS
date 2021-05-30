import { Hostable } from "../Hostable";

export interface RoomEvent {
    /**
     * The room or client that the event came from.
     */
    room: Hostable;
}
