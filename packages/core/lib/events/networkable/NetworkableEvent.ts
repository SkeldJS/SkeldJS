import { AnyNetworkable, Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class NetworkableEvent extends RoomEvent {
    /**
     * The component in question.
     */
    component: AnyNetworkable;

    constructor(room: Hostable<any>, component: AnyNetworkable) {
        super(room);

        this.component = component;
    }
}
