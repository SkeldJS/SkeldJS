import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerVoteState } from "../../misc/PlayerVoteState";
import { PlayerData } from "../../PlayerData";
import { MeetingHudEvent } from "./MeetingHudEvent";

export class MeetingHudVotingCompleteEvent extends MeetingHudEvent {
    static eventName = "meetinghud.votingcomplete" as const;
    eventName = "meetinghud.votingcomplete" as const;

    tie: boolean;
    ejected: PlayerData;
    voteStates: Map<number, PlayerVoteState>;

    constructor(
        room: Hostable<any>,
        meetinghud: MeetingHud,
        tie: boolean,
        ejected: PlayerData,
        voteStates: Map<number, PlayerVoteState>
    ) {
        super(room, meetinghud);

        this.tie = tie;
        this.ejected = ejected;
        this.voteStates = voteStates;
    }
}
