import { LobbyBehaviour } from "../../component";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class LobbyBehaviourEvent extends RoomEvent {
    /**
     * The lobby behaviour object in question.
     */
    lobbybehaviour: LobbyBehaviour;

    constructor(room: Hostable<any>, lobbybehaviour: LobbyBehaviour) {
        super(room);

        this.lobbybehaviour = lobbybehaviour;
    }
}
