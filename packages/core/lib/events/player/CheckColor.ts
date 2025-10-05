import { CancelableEvent } from "@skeldjs/events";
import { CheckColorMessage } from "@skeldjs/protocol";
import { Color } from "@skeldjs/constant";

import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";

/**
 * Emitted when a player requests to have their color set. Only emitted if the
 * client is the host.
 */
export class PlayerCheckColorEvent<RoomType extends StatefulRoom> extends CancelableEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.checkcolor" as const;
    eventName = "player.checkcolor" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: CheckColorMessage | undefined,
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
