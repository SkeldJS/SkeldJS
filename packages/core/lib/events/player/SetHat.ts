import { Hat } from "@skeldjs/constant";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player updates their hat.
 */
export class PlayerSetHatEvent extends PlayerEvent {
    static eventName = "player.sethat" as const;
    eventName = "player.sethat" as const;

    /**
     * The hat of the player.
     */
    hat: Hat;

    constructor(room: Hostable<any>, player: PlayerData, hat: Hat) {
        super(room, player);

        this.hat = hat;
    }
}
