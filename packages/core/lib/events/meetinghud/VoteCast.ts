import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { MeetingHudEvent } from "./MeetingHudEvent";

export class MeetingHudVoteCastEvent extends MeetingHudEvent {
    static eventName = "meetinghud.votecast" as const;
    eventName = "meetinghud.votecast" as const;

    room: Hostable;
    meetinghud: MeetingHud;
    voter: PlayerData;
    suspect?: PlayerData;

    constructor(
        room: Hostable,
        meetinghud: MeetingHud,
        voter: PlayerData,
        suspect?: PlayerData
    ) {
        super(room, meetinghud);

        this.voter = voter;
        this.suspect = suspect;
    }
}
