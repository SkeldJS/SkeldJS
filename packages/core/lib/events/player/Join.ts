import { BasicEvent } from "@skeldjs/events";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player joins the room.
 */
export class PlayerJoinEvent extends BasicEvent implements RoomEvent, PlayerEvent {
    static eventName = "player.join" as const;
    eventName = "player.join" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData
    ) {
        super();
    }
}
