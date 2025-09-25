import { BasicEvent } from "@skeldjs/events";
import { StartMeetingMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";

/**
 * Emitted when a meeting is started, either by a player reporting a body or
 * calling an emergency meetting.
 *
 * This guarantees that the meeting has actually started, see
 * {@link PlayerReportDeadBodyEvent} for an event that can prevent a meeting from
 * being started if you are the host.
 */
export class PlayerStartMeetingEvent<RoomType extends StatefulRoom = StatefulRoom> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.startmeeting" as const;
    eventName = "player.startmeeting" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: StartMeetingMessage | undefined,
        /**
         * The player who called the meeting, either by reporting a body or
         * calling an emergency meeting.
         */
        public readonly caller: Player<RoomType>,
        /**
         * The player of the body that was reported, or "emergency" if the
         * meeting is an emergency meeting.
         */
        public readonly body: Player<RoomType> | "emergency"
    ) {
        super();
    }
}
