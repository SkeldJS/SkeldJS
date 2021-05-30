import { BasicEvent } from "@skeldjs/events";
import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SendChatMessage } from "@skeldjs/protocol";

export class PlayerSendChatEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.chat" as const;
    eventName = "player.chat" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: SendChatMessage|undefined,
        public readonly chatMessage: string
    ) {
        super();
    }
}
