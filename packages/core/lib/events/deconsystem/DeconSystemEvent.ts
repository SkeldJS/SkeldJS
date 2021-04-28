import { Hostable } from "../../Hostable";
import { DeconSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class DeconSystemEvent extends RoomEvent {
    system: DeconSystem;

    constructor(room: Hostable<any>, system: DeconSystem) {
        super(room);

        this.system = system;
    }
}
