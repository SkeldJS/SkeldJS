import { BasicEvent } from "@skeldjs/events";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player leaves the room.
 */
export class PlayerLeaveEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType> {
    static eventName = "player.leave" as const;
    eventName = "player.leave" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>
    ) {
        super();
    }
}
