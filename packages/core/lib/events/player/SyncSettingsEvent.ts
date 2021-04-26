import { GameOptions } from "@skeldjs/protocol";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class SyncSettingsEvent extends PlayerEvent {
    static eventName = "player.syncsettings" as const;
    eventName = "player.syncsettings" as const;

    options: GameOptions;

    constructor(
        room: Hostable,
        player: PlayerData,
        options: GameOptions
    ) {
        super(room, player);

        this.options = options;
    }
}
