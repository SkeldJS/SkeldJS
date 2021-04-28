import { Hostable, PrivacyType } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class RoomSetVisibilityEvent extends RoomEvent {
    static eventName = "room.setvisibility" as const;
    eventName = "room.setvisibility" as const;

    visibility: PrivacyType;

    constructor(room: Hostable<any>, visibility: PrivacyType) {
        super(room);

        this.visibility = visibility;
    }
}
