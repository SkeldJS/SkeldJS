import { BasicEvent } from "@skeldjs/events";
import { VotingCompleteMessage } from "@skeldjs/protocol";
import { MeetingHud } from "../../objects";
import { StatefulRoom } from "../../StatefulRoom";
import { PlayerVoteState } from "../../misc/PlayerVoteState";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { MeetingHudEvent } from "./MeetingHudEvent";

/**
 * Emitted when a meeting is finished, and when the ejected player is determined.
 */
export class MeetingHudVotingCompleteEvent<RoomType extends StatefulRoom> extends BasicEvent implements MeetingHudEvent<RoomType>, ProtocolEvent {
    static eventName = "meeting.votingcomplete" as const;
    eventName = "meeting.votingcomplete" as const;

    constructor(
        public readonly room: RoomType,
        public readonly meetinghud: MeetingHud<RoomType>,
        public readonly message: VotingCompleteMessage | undefined,
        /**
         * Whether a tie was reached in votes.
         */
        public readonly tie: boolean,
        /**
         * The voting state of every player in the meeting.
         */
        public readonly voteStates: Map<number, PlayerVoteState<RoomType>>,
        /**
         * The player that was ejected. Undefined if a tie was reached
         * or if players voted to skip.
         */
        public readonly ejected?: Player<RoomType>
    ) {
        super();
    }
}
