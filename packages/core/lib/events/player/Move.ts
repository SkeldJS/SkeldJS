import { BasicEvent } from "@skeldjs/events";
import { Vector2 } from "@skeldjs/util";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player moves.
 */
export class PlayerMoveEvent<RoomType extends StatefulRoom = StatefulRoom> extends BasicEvent implements RoomEvent, PlayerEvent {
    static eventName = "player.move" as const;
    eventName = "player.move" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        /**
         * The old position of the player.
         */
        public readonly oldPosition: Vector2,
        /**
         * The new position of the player.
         */
        public readonly newPosition: Vector2,
    ) {
        super();
    }
}
