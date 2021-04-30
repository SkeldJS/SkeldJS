import { Hostable, PrivacyType } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when the host changes the publicity of the room.
 */
export class RoomSetVisibilityEvent extends RoomEvent {
    static eventName = "room.setvisibility" as const;
    eventName = "room.setvisibility" as const;

    /**
     * The publicity of the room.
     */
    visibility: PrivacyType;

    constructor(room: Hostable<any>, visibility: PrivacyType) {
        super(room);

        this.visibility = visibility;
    }
}
