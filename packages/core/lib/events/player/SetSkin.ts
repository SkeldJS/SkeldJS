import { Skin } from "@skeldjs/constant";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerSetSkinEvent extends PlayerEvent {
    static eventName = "player.setskin" as const;
    eventName = "player.setskin" as const;

    skin: Skin;

    constructor(room: Hostable, player: PlayerData, skin: Skin) {
        super(room, player);

        this.skin = skin;
    }
}
