import { StatefulRoom } from "../../StatefulRoom";
import { LifeSuppSystem } from "../../systems/LifeSuppSystem";
import { RoomEvent } from "../RoomEvent";

export interface O2Event<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The oxygen system that this event is for.
     */
    oxygen: LifeSuppSystem<RoomType>;
}
