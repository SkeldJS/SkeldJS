import { BasicEvent } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { Networkable } from "../../Networkable";
import { RoomEvent } from "../RoomEvent";
import { NetworkableEvent } from "./NetworkableEvent";

export class NetworkableDespawnEvent extends BasicEvent implements RoomEvent, NetworkableEvent {
    static eventName = "component.despawn" as const;
    eventName = "component.despawn" as const;

    constructor(
        public readonly room: Hostable,
        public readonly networkable: Networkable
    ) {
        super();
    }
}
