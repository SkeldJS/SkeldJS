import { Hostable } from "../../Hostable";
import { DoorsSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class DoorsSystemEvent extends RoomEvent {
    system: DoorsSystem;

    constructor(room: Hostable, system: DoorsSystem) {
        super(room);

        this.system = system;
    }
}
