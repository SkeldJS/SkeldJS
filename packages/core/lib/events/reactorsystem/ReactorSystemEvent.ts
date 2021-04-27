import { Hostable } from "../../Hostable";
import { ReactorSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class ReactorSystemEvent extends RoomEvent {
    system: ReactorSystem;

    constructor(room: Hostable, system: ReactorSystem) {
        super(room);

        this.system = system;
    }
}
