import { Color } from "@skeldjs/constant";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player updates their color.
 */
export class PlayerSetColorEvent extends PlayerEvent {
    static eventName = "player.setcolor" as const;
    eventName = "player.setcolor" as const;

    /**
     * The color of the player.
     */
    color: Color;

    constructor(room: Hostable<any>, player: PlayerData, color: Color) {
        super(room, player);

        this.color = color;
    }
}
