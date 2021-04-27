import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { MeetingHudEvent } from "./MeetingHudEvent";

export class MeetingHudVoteClearEvent extends MeetingHudEvent {
    static eventName = "meetinghud.voteclear" as const;
    eventName = "meetinghud.voteclear" as const;

    player: PlayerData;

    constructor(room: Hostable, meetinghud: MeetingHud, player: PlayerData) {
        super(room, meetinghud);

        this.player = player;
    }
}
