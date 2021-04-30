import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player enters a vent.
 */
export class PlayerEnterVentEvent extends PlayerEvent {
    static eventName = "player.entervent" as const;
    eventName = "player.entervent" as const;

    /**
     * The ID of the vent that the player entered.
     */
    ventid: number;

    constructor(room: Hostable<any>, player: PlayerData, ventid: number) {
        super(room, player);

        this.ventid = ventid;
    }
}
