import { Hostable } from "../../Hostable";
import { SabotageSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class SabotageSystemEvent extends RoomEvent {
    /**
     * The sabotage system in question.
     */
    system: SabotageSystem;

    constructor(room: Hostable<any>, system: SabotageSystem) {
        super(room);

        this.system = system;
    }
}
