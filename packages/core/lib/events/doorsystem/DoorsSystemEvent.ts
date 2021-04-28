import { Hostable } from "../../Hostable";
import { DoorsSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class DoorsSystemEvent extends RoomEvent {
    /**
     * The doors system in question.
     */
    system: DoorsSystem;

    constructor(room: Hostable<any>, system: DoorsSystem) {
        super(room);

        this.system = system;
    }
}
