import { RevertableEvent } from "@skeldjs/events";

import { HeliSabotageEvent } from "./HeliSabotageEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { HeliSabotageSystem } from "../../systems";

/**
 * Emitted when the heli sabotage consoles on Airship are reset, i.e. when the 10s
 * timer reaches 0.
 */
export class HeliSabotageConsolesResetEvent<RoomType extends StatefulRoom> extends RevertableEvent implements HeliSabotageEvent<RoomType> {
    static eventName = "heli.consoles.reset" as const;
    eventName = "heli.consoles.reset" as const;

    constructor(
        public readonly room: RoomType,
        public readonly helisabotagesystem: HeliSabotageSystem<RoomType>
    ) {
        super();
    }
}
