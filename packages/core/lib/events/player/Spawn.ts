import { BasicEvent } from "@skeldjs/events";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player has all of their components fully spawned.
 */
export class PlayerSpawnEvent<RoomType extends StatefulRoom = StatefulRoom> extends BasicEvent implements RoomEvent, PlayerEvent {
    static eventName = "player.spawn" as const;
    eventName = "player.spawn" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>
    ) {
        super();
    }
}
