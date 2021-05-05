import { Color } from "@skeldjs/constant";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player asks the host to check and set a colour.
 *
 * Only received if the current client is the host of the room.
 *
 * @example
 * ```ts
 * // Force a player's colour to always be the one next to what they originally chose.
 * client.on("gamedata.checkcolor", ev => {
 *   ev.setColor((ev.color + 1) % 12);
 * });
 * ```
 */
export class PlayerCheckColorEvent extends PlayerEvent {
    static eventName = "player.checkcolor" as const;
    eventName = "player.checkcolor" as const;

    /**
     * The color that the player is requesting.
     */
    original: Color;

    /**
     * The altered color of the player.
     */
    altered: Color;

    constructor(
        room: Hostable<any>,
        player: PlayerData,
        color: Color,
        altered: Color
    ) {
        super(room, player);

        this.original = color;
        this.altered = altered;
    }

    setColor(color: Color) {
        this.altered = color;
    }

    revert() {
        this.altered = this.original;
    }
}
