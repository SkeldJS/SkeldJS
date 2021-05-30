import { BasicEvent } from "@skeldjs/events";
import { VotingCompleteMessage } from "@skeldjs/protocol";
import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerVoteState } from "../../misc/PlayerVoteState";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { MeetingHudEvent } from "./MeetingHudEvent";

export class MeetingHudVotingCompleteEvent extends BasicEvent implements RoomEvent, MeetingHudEvent, ProtocolEvent {
    static eventName = "meetinghud.votingcomplete" as const;
    eventName = "meetinghud.votingcomplete" as const;

    constructor(
        public readonly room: Hostable,
        public readonly meetinghud: MeetingHud,
        public readonly message: VotingCompleteMessage|undefined,
        public readonly tie: boolean,
        public readonly voteStates: Map<number, PlayerVoteState>,
        public readonly ejected?: PlayerData
    ) {
        super();
    }
}
