import { VoteBanSystem } from "../../component";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class VoteBanSystemEvent extends RoomEvent {
    votebansystem: VoteBanSystem;

    constructor(room: Hostable<any>, votebansystem: VoteBanSystem) {
        super(room);

        this.votebansystem = votebansystem;
    }
}
