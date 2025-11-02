import { BasicEvent } from "@skeldjs/events";
import { QuickChatMessageData, SendQuickChatMessage } from "@skeldjs/au-protocol";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";

/**
 * Emitted when a player sends a quick chat message. See {@link PlayerSendChatEvent}
 * to litsen for normal chat messages.
 *
 * Due to technical impossibilities, this event cannot be canceled or reverted.
 */
export class PlayerSendQuickChatEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.quickchat" as const;
    eventName = "player.quickchat" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: SendQuickChatMessage | undefined,
        /**
         * The message that the player sent.
         */
        public readonly chatMessage: QuickChatMessageData
    ) {
        super();
    }
}
