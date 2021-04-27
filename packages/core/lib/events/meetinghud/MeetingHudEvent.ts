import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class MeetingHudEvent extends RoomEvent {
    meetinghud: MeetingHud;

    constructor(room: Hostable, meetinghud: MeetingHud) {
        super(room);

        this.meetinghud = meetinghud;
    }
}
