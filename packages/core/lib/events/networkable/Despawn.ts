import { BasicEvent } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { Networkable } from "../../Networkable";
import { RoomEvent } from "../RoomEvent";
import { NetworkableEvent } from "./NetworkableEvent";

/**
 * Emitted when a component is despawned.
 */
export class NetworkableDespawnEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, NetworkableEvent {
    static eventName = "component.despawn" as const;
    eventName = "component.despawn" as const;

    constructor(
        public readonly room: RoomType,
        public readonly networkable: Networkable<RoomType>
    ) {
        super();
    }
}
