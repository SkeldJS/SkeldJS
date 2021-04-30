import { Hostable } from "../../Hostable";
import { Door } from "../../misc/Door";
import { RoomEvent } from "../RoomEvent";

export class DoorEvent extends RoomEvent {
    /**
     * The door in question.
     */
    door: Door;

    constructor(room: Hostable<any>, door: Door) {
        super(room);

        this.door = door;
    }
}
