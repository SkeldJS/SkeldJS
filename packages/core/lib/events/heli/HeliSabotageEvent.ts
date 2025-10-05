import { StatefulRoom } from "../../StatefulRoom";
import { HeliSabotageSystem } from "../../systems";
import { RoomEvent } from "../RoomEvent";

export interface HeliSabotageEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The heli sabotage system that this event is for.
     */
    helisabotagesystem: HeliSabotageSystem<RoomType>;
}
