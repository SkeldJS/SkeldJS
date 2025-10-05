import { CancelableEvent } from "@skeldjs/events";
import { CloseMessage } from "@skeldjs/protocol";
import { MeetingHud } from "../../objects";
import { StatefulRoom } from "../../StatefulRoom";
import { ProtocolEvent } from "../ProtocolEvent";
import { MeetingHudEvent } from "./MeetingHudEvent";

/**
 * Emitted when the current meeting closes.
 *
 * To listen for when a meeting actually ends and when a player gets ejected,
 * see {@link MeetingHudVotingCompleteEvent}.
 */
export class MeetingHudCloseEvent<RoomType extends StatefulRoom> extends CancelableEvent implements MeetingHudEvent<RoomType>, ProtocolEvent {
    static eventName = "meeting.close" as const;
    eventName = "meeting.close" as const;

    constructor(
        public readonly room: RoomType,
        public readonly meetinghud: MeetingHud<RoomType>,
        public readonly message: CloseMessage
    ) {
        super();
    }
}
