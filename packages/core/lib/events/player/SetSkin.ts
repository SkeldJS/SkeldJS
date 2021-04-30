import { Skin } from "@skeldjs/constant";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player updates their skin.
 */
export class PlayerSetSkinEvent extends PlayerEvent {
    static eventName = "player.setskin" as const;
    eventName = "player.setskin" as const;

    /**
     * The skin of the player.
     */
    skin: Skin;

    constructor(room: Hostable<any>, player: PlayerData, skin: Skin) {
        super(room, player);

        this.skin = skin;
    }
}
