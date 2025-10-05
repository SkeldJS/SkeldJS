import { Player } from "../../Player";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";

export interface PlayerEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The player that this event is for.
     */
    player: Player<RoomType>;
}
