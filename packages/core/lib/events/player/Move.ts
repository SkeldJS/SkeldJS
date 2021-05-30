import { BasicEvent } from "@skeldjs/events";
import { Vector2 } from "@skeldjs/util";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerMoveEvent extends BasicEvent implements RoomEvent, PlayerEvent {
    static eventName = "player.move" as const;
    eventName = "player.move" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly position: Vector2,
        public readonly velocity: Vector2
    ) {
        super();
    }
}
