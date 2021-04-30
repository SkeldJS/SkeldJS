import { Hostable } from "../../Hostable";
import { LifeSuppSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class O2SystemEvent extends RoomEvent {
    /**
     * The oxygen system in question.
     */
    system: LifeSuppSystem;

    constructor(room: Hostable<any>, system: LifeSuppSystem) {
        super(room);

        this.system = system;
    }
}
