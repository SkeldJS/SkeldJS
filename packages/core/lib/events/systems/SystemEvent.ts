import { StatefulRoom } from "../../StatefulRoom";
import { AnySystem } from "../../systems/events";
import { RoomEvent } from "../RoomEvent";

export interface SystemEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The system that this event is for.
     */
    system: AnySystem<RoomType>;
}
