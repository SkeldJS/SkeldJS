import { NetworkedPlayerInfo } from "../../objects";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";

export interface PlayerInfoEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The gamedata object that this event is for.
     */
    playerInfo: NetworkedPlayerInfo<RoomType>;
}
