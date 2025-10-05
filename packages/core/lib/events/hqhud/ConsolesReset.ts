import { RevertableEvent } from "@skeldjs/events";

import { HqHudEvent } from "./HqHudEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { HqHudSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";

/**
 * Emitted when the communication consoles on Mira HQ are reset, i.e. when the 10s
 * timer reaches 0.
 */
export class HqHudConsolesResetEvent<RoomType extends StatefulRoom> extends RevertableEvent implements HqHudEvent<RoomType> {
    static eventName = "hqhud.consoles.reset" as const;
    eventName = "hqhud.consoles.reset" as const;

    constructor(
        public readonly room: RoomType,
        public readonly hqhudsystem: HqHudSystem<RoomType>
    ) {
        super();
    }
}
