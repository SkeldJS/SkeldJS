import { BasicEvent } from "@skeldjs/events";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player has all of their components fully spawned.
 */
export class PlayerSpawnEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType> {
    static eventName = "player.spawn" as const;
    eventName = "player.spawn" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>
    ) {
        super();
    }
}
