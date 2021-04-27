import { Hat } from "@skeldjs/constant";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerSetHatEvent extends PlayerEvent {
    static eventName = "player.sethat" as const;
    eventName = "player.sethat" as const;

    hat: Hat;

    constructor(room: Hostable, player: PlayerData, hat: Hat) {
        super(room, player);

        this.hat = hat;
    }
}
