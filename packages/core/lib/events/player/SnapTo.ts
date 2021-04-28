import { Vector2 } from "@skeldjs/util";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerSnapToEvent extends PlayerEvent {
    static eventName = "player.snapto" as const;
    eventName = "player.snapto" as const;

    position: Vector2;

    constructor(room: Hostable<any>, player: PlayerData, position: Vector2) {
        super(room, player);

        this.position = position;
    }
}
