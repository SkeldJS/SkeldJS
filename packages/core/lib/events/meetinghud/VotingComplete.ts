import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerVoteState } from "../../misc/PlayerVoteState";
import { PlayerData } from "../../PlayerData";
import { MeetingHudEvent } from "./MeetingHudEvent";

/**
 * Emitted when voting is complete, either by the timer reaching 0 or everyone having voted.
 */
export class MeetingHudVotingCompleteEvent extends MeetingHudEvent {
    static eventName = "meetinghud.votingcomplete" as const;
    eventName = "meetinghud.votingcomplete" as const;

    /**
     * Whether or not the votes resulted in a tie.
     */
    tie: boolean;

    /**
     * The player that was ejected.
     *
     * This will be undefined if players voted to skip or if there was a tie.
     */
    ejected?: PlayerData;

    /**
     * The vote states for every player, mapped by their player ID.
     */
    voteStates: Map<number, PlayerVoteState>;

    constructor(
        room: Hostable<any>,
        meetinghud: MeetingHud,
        tie: boolean,
        voteStates: Map<number, PlayerVoteState>,
        ejected?: PlayerData,
    ) {
        super(room, meetinghud);

        this.tie = tie;
        this.ejected = ejected;
        this.voteStates = voteStates;
    }
}
