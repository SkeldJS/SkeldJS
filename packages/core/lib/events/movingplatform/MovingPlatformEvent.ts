import { StatefulRoom } from "../../StatefulRoom";
import { MovingPlatformSystem } from "../../systems";
import { RoomEvent } from "../RoomEvent";

export interface MovingPlatformEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The moving platform system that this event is for.
     */
    movingplatform: MovingPlatformSystem<RoomType>;
}
