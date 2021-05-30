import { BasicEvent } from "@skeldjs/events";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerSpawnEvent extends BasicEvent implements RoomEvent, PlayerEvent {
    static eventName = "player.spawn" as const;
    eventName = "player.spawn" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData
    ) {
        super();
    }
}
