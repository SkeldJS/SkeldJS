import { CancelableEvent } from "@skeldjs/events";
import { CheckColorMessage } from "@skeldjs/protocol";
import { Color } from "@skeldjs/constant";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player requests to have their color set. Only emitted if the
 * client is the host.
 */
export class PlayerCheckColorEvent<RoomType extends Hostable = Hostable> extends CancelableEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.checkcolor" as const;
    eventName = "player.checkcolor" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: CheckColorMessage|undefined,
        /**
         * The original color that the player asked for.
         */
        public readonly originalColor: Color,
        /**
         * The altered color, i.e. the original color was taken.
         */
        public alteredColor: Color
    ) {
        super();
    }

    /**
     * Change the altered color for the player to have set.
     * @param color The color to set.
     */
    setColor(color: Color) {
        this.alteredColor = color;
    }
}
