import { BasicEvent } from "@skeldjs/events";
import { ClearVoteMessage } from "@skeldjs/protocol";

import { MeetingHud } from "../../objects";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { MeetingHudEvent } from "./MeetingHudEvent";

/**
 * Emitted when a player's vote is cleared.
 */
export class MeetingHudClearVoteEvent<RoomType extends StatefulRoom> extends BasicEvent implements MeetingHudEvent<RoomType>, ProtocolEvent {
    static eventName = "meeting.clearvote" as const;
    eventName = "meeting.clearvote" as const;

    constructor(
        public readonly room: RoomType,
        public readonly meetinghud: MeetingHud<RoomType>,
        public readonly message: ClearVoteMessage | undefined,
        /**
         * The player that had their vote cleared.
         */
        public readonly player: Player<RoomType>
    ) {
        super();
    }
}