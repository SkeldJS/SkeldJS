import { MeetingHudEvent } from "./MeetingHudEvent";

/**
 * Emitted when the meeting hud is closed, i.e. from voting being complete.
 */
export class MeetingHudMeetingCloseEvent extends MeetingHudEvent {
    static eventName = "meetinghud.close" as const;
    eventName = "meetinghud.close" as const;
}
