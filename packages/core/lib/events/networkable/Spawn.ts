import { BasicEvent } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { Networkable } from "../../Networkable";
import { RoomEvent } from "../RoomEvent";
import { NetworkableEvent } from "./NetworkableEvent";

/**
 * Emitted when a component is spawned.
 */
export class ComponentSpawnEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, NetworkableEvent {
    static eventName = "component.spawn" as const;
    eventName = "component.spawn" as const;

    constructor(
        public readonly room: RoomType,
        public readonly component: Networkable<RoomType>
    ) {
        super();
    }
}
