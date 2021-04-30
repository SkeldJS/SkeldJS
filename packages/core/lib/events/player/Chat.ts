import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player sends a chat message.
 */
export class PlayerChatEvent extends PlayerEvent {
    static eventName = "player.chat" as const;
    eventName = "player.chat" as const;

    /**
     * The message that the player sent.
     */
    message: string;

    constructor(room: Hostable<any>, player: PlayerData, message: string) {
        super(room, player);

        this.message = message;
    }
}
