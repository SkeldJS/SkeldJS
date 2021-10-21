import { RevertableEvent } from "@skeldjs/events";

import { RoomEvent } from "../RoomEvent";
import { HeliSabotageEvent } from "./HeliSabotageEvent";
import { Hostable } from "../../Hostable";
import { HeliSabotageSystem } from "../../systems";

/**
 * Emitted when the heli sabotage consoles on Airship are reset, i.e. when the 10s
 * timer reaches 0.
 */
export class HeliSabotageConsolesResetEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, HeliSabotageEvent {
    static eventName = "heli.consoles.reset" as const;
    eventName = "heli.consoles.reset" as const;

    constructor(
        public readonly room: RoomType,
        public readonly helisabotagesystem: HeliSabotageSystem<RoomType>
    ) {
        super();
    }
}
