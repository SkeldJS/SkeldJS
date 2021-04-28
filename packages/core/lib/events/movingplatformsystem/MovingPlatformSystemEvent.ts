import { Hostable } from "../../Hostable";
import { MovingPlatformSystem } from "../../system";
import { RoomEvent } from "../RoomEvent";

export class MovingPlatformSystemEvent extends RoomEvent {
    /**
     * The moving platform system in question.
     */
    system: MovingPlatformSystem;

    constructor(room: Hostable<any>, system: MovingPlatformSystem) {
        super(room);

        this.system = system;
    }
}
