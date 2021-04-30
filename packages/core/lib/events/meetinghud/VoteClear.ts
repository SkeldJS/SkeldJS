import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { MeetingHudEvent } from "./MeetingHudEvent";

/**
 * Emitted when someone's vote gets cleared, i.e. the suspect disconnected.
 */
export class MeetingHudVoteClearEvent extends MeetingHudEvent {
    static eventName = "meetinghud.voteclear" as const;
    eventName = "meetinghud.voteclear" as const;

    /**
     * The player that had their vote cleared.
     */
    player: PlayerData;

    constructor(room: Hostable<any>, meetinghud: MeetingHud, player: PlayerData) {
        super(room, meetinghud);

        this.player = player;
    }
}
