import { BasicEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { NetworkedObject } from "../../NetworkedObject";
import { RoomEvent } from "../RoomEvent";
import { NetworkedObjectEvent } from "./NetworkedObjectEvent";

/**
 * Emitted when a component is despawned.
 */
export class ComponentDespawnEvent<RoomType extends StatefulRoom> extends BasicEvent implements NetworkedObjectEvent<RoomType> {
    static eventName = "component.despawn" as const;
    eventName = "component.despawn" as const;

    constructor(
        public readonly room: RoomType,
        public readonly component: NetworkedObject<RoomType>
    ) {
        super();
    }
}
