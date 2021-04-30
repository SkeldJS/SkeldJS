import { GameOptions } from "@skeldjs/protocol";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when the host updates the room settings.
 */

export class PlayerSyncSettingsEvent extends PlayerEvent {
    static eventName = "player.syncsettings" as const;
    eventName = "player.syncsettings" as const;

    /**
     * The settings of the room.
     */
    options: GameOptions;

    constructor(room: Hostable<any>, player: PlayerData, options: GameOptions) {
        super(room, player);

        this.options = options;
    }
}
