import { Color } from "@skeldjs/constant";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerSetColorEvent extends PlayerEvent {
    static eventName = "player.setcolor" as const;
    eventName = "player.setcolor" as const;

    color: Color;

    constructor(room: Hostable, player: PlayerData, color: Color) {
        super(room, player);

        this.color = color;
    }
}
