import { BasicEvent } from "@skeldjs/events";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { SendChatMessage } from "@skeldjs/au-protocol";

/**
 * Emitted when a player sends a free chat message. See {@link PlayerSendQuickChatEvent}
 * to listen for quick chat messages.
 *
 * Due to technical impossibilities, this event cannot be canceled or reverted.
 */
export class PlayerSendChatEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.chat" as const;
    eventName = "player.chat" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: SendChatMessage | undefined,
        /**
         * The message that the player sent.
         */
        public readonly chatMessage: string
    ) {
        super();
    }
}
