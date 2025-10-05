import { StatefulRoom } from "../../StatefulRoom";
import { HqHudSystem } from "../../systems/HqHudSystem";
import { RoomEvent } from "../RoomEvent";

export interface HqHudEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The Mira HQ communications system that this event is for.
     */
    hqhudsystem: HqHudSystem<RoomType>;
}
