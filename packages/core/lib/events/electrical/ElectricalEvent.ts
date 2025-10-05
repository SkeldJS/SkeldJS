import { StatefulRoom } from "../../StatefulRoom";
import { SwitchSystem } from "../../systems";
import { RoomEvent } from "../RoomEvent";

export interface ElectricalEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The electrical system that the event is for.
     */
    switchsystem: SwitchSystem<RoomType>;
}
