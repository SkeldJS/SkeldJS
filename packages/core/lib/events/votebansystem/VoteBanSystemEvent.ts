import { VoteBanSystem } from "../../component";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class VoteBanSystemEvent extends RoomEvent {
    /**
     * The vote ban system in question.
     */
    votebansystem: VoteBanSystem;

    constructor(room: Hostable<any>, votebansystem: VoteBanSystem) {
        super(room);

        this.votebansystem = votebansystem;
    }
}
