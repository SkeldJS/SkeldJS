import { CancelableEvent } from "@skeldjs/events";
import { CloseMessage } from "@skeldjs/protocol";
import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { MeetingHudEvent } from "./MeetingHudEvent";

export class MeetingHudCloseEvent extends CancelableEvent implements RoomEvent, MeetingHudEvent, ProtocolEvent {
    static eventName = "meetinghud.close" as const;
    eventName = "meetinghud.close" as const;

    constructor(
        public readonly room: Hostable,
        public readonly meetinghud: MeetingHud,
        public readonly message: CloseMessage
    ) {
        super();
    }
}
