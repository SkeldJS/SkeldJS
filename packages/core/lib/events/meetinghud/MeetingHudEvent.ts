import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class MeetingHudEvent extends RoomEvent {
    /**
     * The meeting hud object in question.
     */
    meetinghud: MeetingHud;

    constructor(room: Hostable<any>, meetinghud: MeetingHud) {
        super(room);

        this.meetinghud = meetinghud;
    }
}
