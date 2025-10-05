import { MeetingHud } from "../../objects";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";

export interface MeetingHudEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The meeting handler that this event is for.
     */
    meetinghud: MeetingHud<RoomType>;
}
