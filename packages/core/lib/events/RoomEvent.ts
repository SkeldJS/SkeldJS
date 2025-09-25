import { StatefulRoom } from "../StatefulRoom";

export interface RoomEvent<RoomType extends StatefulRoom = StatefulRoom> {
    /**
     * The room or client that the event came from.
     */
    room: RoomType;
}
