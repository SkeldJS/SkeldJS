import { Hostable } from "../../Hostable";
import { SecurityCameraSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class SecurityCameraSystemEvent extends RoomEvent {
    /**
     * The security camera system in question.
     */
    system: SecurityCameraSystem;

    constructor(room: Hostable<any>, system: SecurityCameraSystem) {
        super(room);

        this.system = system;
    }
}
