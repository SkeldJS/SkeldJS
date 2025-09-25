import { BasicEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { NetworkedObject } from "../../NetworkedObject";
import { RoomEvent } from "../RoomEvent";
import { NetworkedObjectEvent } from "./NetworkedObjectEvent";

/**
 * Emitted when a component is spawned.
 */
export class ComponentSpawnEvent<RoomType extends StatefulRoom = StatefulRoom> extends BasicEvent implements RoomEvent, NetworkedObjectEvent {
    static eventName = "component.spawn" as const;
    eventName = "component.spawn" as const;

    constructor(
        public readonly room: RoomType,
        public readonly component: NetworkedObject<RoomType>
    ) {
        super();
    }
}
