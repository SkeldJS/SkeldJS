import { Hostable } from "../../Hostable";
import { SecurityCameraSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class SecurityCameraSystemEvent extends RoomEvent {
    system: SecurityCameraSystem;

    constructor(room: Hostable, system: SecurityCameraSystem) {
        super(room);

        this.system = system;
    }
}
