import { BasicEvent } from "@skeldjs/events";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player joins the room.
 */
export class PlayerJoinEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType> {
    static eventName = "player.join" as const;
    eventName = "player.join" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>
    ) {
        super();
    }
}
