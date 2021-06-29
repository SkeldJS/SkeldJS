import { Hostable } from "../Hostable";

export interface RoomEvent<RoomType extends Hostable = Hostable> {
    /**
     * The room or client that the event came from.
     */
    room: RoomType;
}
