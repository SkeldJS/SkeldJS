import { Color } from "@skeldjs/constant";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class CheckColorEvent extends PlayerEvent {
    static eventName = "player.checkcolor" as const;
    eventName = "player.checkcolor" as const;

    color: Color;

    constructor(
        room: Hostable,
        player: PlayerData,
        color: Color
    ) {
        super(room, player);

        this.color = color;
    }

    setColor(color: Color) {
        this.color = color;
    }
}
