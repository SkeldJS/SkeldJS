import { MeetingHudEvent } from "./MeetingHudEvent";

export class MeetingHudMeetingCloseEvent extends MeetingHudEvent {
    static eventName = "meetinghud.close" as const;
    eventName = "meetinghud.close" as const;
}
