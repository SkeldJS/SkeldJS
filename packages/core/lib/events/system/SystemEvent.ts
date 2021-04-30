import { Hostable } from "../../Hostable";
import { AnySystem } from "../../system/events";
import { RoomEvent } from "../RoomEvent";

export class SystemEvent extends RoomEvent {
    /**
     * The system in question.
     */
    system: AnySystem;

    constructor(room: Hostable<any>, system: AnySystem) {
        super(room);

        this.system = system;
    }
}
