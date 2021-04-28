import { Vector2 } from "@skeldjs/util";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player moves.
 */
export class PlayerMoveEvent extends PlayerEvent {
    static eventName = "player.move" as const;
    eventName = "player.move" as const;

    /**
     * The unlerped position that the player moved to.
     */
    position: Vector2;

    /**
     * The velocity of the player.
     */
    velocity: Vector2;

    constructor(
        room: Hostable<any>,
        player: PlayerData,
        position: Vector2,
        velocity: Vector2
    ) {
        super(room, player);

        this.position = position;
        this.velocity = velocity;
    }
}
