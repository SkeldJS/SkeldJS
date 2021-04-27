import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerChatEvent extends PlayerEvent {
    static eventName = "player.chat" as const;
    eventName = "player.chat" as const;

    message: string;

    constructor(room: Hostable, player: PlayerData, message: string) {
        super(room, player);

        this.message = message;
    }
}
