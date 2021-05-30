import { BasicEvent } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { Networkable } from "../../Networkable";
import { RoomEvent } from "../RoomEvent";
import { NetworkableEvent } from "./NetworkableEvent";

export class NetworkableSpawnEvent extends BasicEvent implements RoomEvent, NetworkableEvent {
    static eventName = "component.spawn" as const;
    eventName = "component.spawn" as const;

    constructor(
        public readonly room: Hostable,
        public readonly networkable: Networkable
    ) {
        super();
    }
}
