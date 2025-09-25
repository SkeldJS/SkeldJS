import { RevertableEvent } from "@skeldjs/events";

import { RoomEvent } from "../RoomEvent";
import { HqHudEvent } from "./HqHudEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { HqHudSystem } from "../../systems";

/**
 * Emitted when the communication consoles on Mira HQ are reset, i.e. when the 10s
 * timer reaches 0.
 */
export class HqHudConsolesResetEvent<RoomType extends StatefulRoom = StatefulRoom> extends RevertableEvent implements RoomEvent, HqHudEvent {
    static eventName = "hqhud.consoles.reset" as const;
    eventName = "hqhud.consoles.reset" as const;

    constructor(
        public readonly room: RoomType,
        public readonly hqhudsystem: HqHudSystem<RoomType>
    ) {
        super();
    }
}
