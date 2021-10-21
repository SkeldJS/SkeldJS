import { RevertableEvent } from "@skeldjs/events";

import { RoomEvent } from "../RoomEvent";
import { HqHudEvent } from "./HqHudEvent";
import { Hostable } from "../../Hostable";
import { HqHudSystem } from "../../systems";

/**
 * Emitted when the communication consoles on Mira HQ are reset, i.e. when the 10s
 * timer reaches 0.
 */
export class HqHudConsolesResetEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, HqHudEvent {
    static eventName = "hqhud.consoles.reset" as const;
    eventName = "hqhud.consoles.reset" as const;

    constructor(
        public readonly room: RoomType,
        public readonly hqhudsystem: HqHudSystem<RoomType>
    ) {
        super();
    }
}
