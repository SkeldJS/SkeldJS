import { NetworkedObject } from "../../NetworkedObject";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";

export interface NetworkedObjectEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The component that this event is for.
     */
    component: NetworkedObject<RoomType>;
}
