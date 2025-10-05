import { StatefulRoom } from "../../StatefulRoom";
import { ReactorSystem } from "../../systems";
import { RoomEvent } from "../RoomEvent";

export interface ReactorEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The reactor system that this event is for.
     */
    reactor: ReactorSystem<RoomType>;
}
