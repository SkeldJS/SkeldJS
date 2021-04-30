import { Vector2 } from "@skeldjs/util";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player snaps to a position, e.g. when they move between vents.
 */
export class PlayerSnapToEvent extends PlayerEvent {
    static eventName = "player.snapto" as const;
    eventName = "player.snapto" as const;

    /**
     * The position that the player snapped to.
     */
    position: Vector2;

    constructor(room: Hostable<any>, player: PlayerData, position: Vector2) {
        super(room, player);

        this.position = position;
    }
}
