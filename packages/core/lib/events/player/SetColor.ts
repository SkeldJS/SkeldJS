import { BasicEvent } from "@skeldjs/events";
import { Color } from "@skeldjs/constant";
import { SetColorMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player has their player color updated.
 */
export class PlayerSetColorEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setcolor" as const;
    eventName = "player.setcolor" as const;

    private _alteredColor: Color;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetColorMessage|undefined,
        /**
         * The color that the player had before.
         */
        public readonly oldColor: Color,
        /**
         * The new color that the player has.
         */
        public readonly newColor: Color
    ) {
        super();

        this._alteredColor = newColor;
    }

    /**
     * The altered color that the player will have set instead, if changed.
     */
    get alteredColor() {
        return this._alteredColor;
    }

    /**
     * Revert the player's color back to their old color.
     */
    revert() {
        this.setColor(this.oldColor);
    }

    /**
     * Change the color that the player had set.
     * @param color The color to set.
     */
    setColor(color: Color) {
        this._alteredColor = color;
    }
}
