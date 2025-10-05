import { StatefulRoom } from "../../StatefulRoom";
import { AutoDoorsSystem, DoorsSystem, ElectricalDoorsSystem } from "../../systems";
import { RoomEvent } from "../RoomEvent";

export interface DoorsEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The door system that the door is in.
     */
    doorsystem: AutoDoorsSystem<RoomType>|DoorsSystem<RoomType>|ElectricalDoorsSystem<RoomType>;
}
