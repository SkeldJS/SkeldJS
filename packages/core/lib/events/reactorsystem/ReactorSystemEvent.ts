import { Hostable } from "../../Hostable";
import { ReactorSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class ReactorSystemEvent extends RoomEvent {
    /**
     * The reactor system in question.
     */
    system: ReactorSystem;

    constructor(room: Hostable<any>, system: ReactorSystem) {
        super(room);

        this.system = system;
    }
}
