import { Color } from "@skeldjs/constant";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player asks the host to check and set a colour.
 *
 * Only received if the current client is the host of the room.
 */
export class PlayerCheckColorEvent extends PlayerEvent {
    static eventName = "player.checkcolor" as const;
    eventName = "player.checkcolor" as const;

    /**
     * The color that the player is requesting.
     */
    color: Color;

    constructor(room: Hostable<any>, player: PlayerData, color: Color) {
        super(room, player);

        this.color = color;
    }

    setColor(color: Color) {
        this.color = color;
    }
}
