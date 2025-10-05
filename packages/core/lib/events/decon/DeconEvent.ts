import { StatefulRoom } from "../../StatefulRoom";
import { DeconSystem } from "../../systems";
import { RoomEvent } from "../RoomEvent";

export interface DeconEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The system that this event came from.
     */
    deconsystem: DeconSystem<RoomType>;
}
