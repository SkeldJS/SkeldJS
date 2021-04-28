import { Hostable } from "../../Hostable";
import { SwitchSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class SwitchSystemEvent extends RoomEvent {
    system: SwitchSystem;

    constructor(room: Hostable<any>, system: SwitchSystem) {
        super(room);

        this.system = system;
    }
}
