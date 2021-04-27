import { Hostable } from "../../Hostable";
import { SabotageSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class SabotageSystemEvent extends RoomEvent {
    system: SabotageSystem;

    constructor(room: Hostable, system: SabotageSystem) {
        super(room);

        this.system = system;
    }
}
