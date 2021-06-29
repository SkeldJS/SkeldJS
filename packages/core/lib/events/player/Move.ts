import { BasicEvent } from "@skeldjs/events";
import { Vector2 } from "@skeldjs/util";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player moves.
 */
export class PlayerMoveEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent {
    static eventName = "player.move" as const;
    eventName = "player.move" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        /**
         * The new position of the player.
         */
        public readonly position: Vector2,
        /**
         * The velocity of the player.
         */
        public readonly velocity: Vector2
    ) {
        super();
    }
}
