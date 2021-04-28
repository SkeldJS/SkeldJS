import { Hostable } from "../../Hostable";
import { SystemStatus } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class SystemEvent extends RoomEvent {
    system: SystemStatus;

    constructor(room: Hostable<any>, system: SystemStatus) {
        super(room);

        this.system = system;
    }
}
