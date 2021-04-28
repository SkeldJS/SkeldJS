import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { MeetingHudEvent } from "./MeetingHudEvent";

/**
 * Emitted when someone casts a vote in a meeting.
 */
export class MeetingHudVoteCastEvent extends MeetingHudEvent {
    static eventName = "meetinghud.votecast" as const;
    eventName = "meetinghud.votecast" as const;

    /**
     * The player that cast the vote.
     */
    voter: PlayerData;

    /**
     * The player that the player voted.
     *
     * This will be undefined if the player voted to skip.
     */
    suspect?: PlayerData;

    constructor(
        room: Hostable<any>,
        meetinghud: MeetingHud,
        voter: PlayerData,
        suspect?: PlayerData
    ) {
        super(room, meetinghud);

        this.voter = voter;
        this.suspect = suspect;
    }
}
