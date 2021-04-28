import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player murders another player.
 */
export class PlayerMurderPlayerEvent extends PlayerEvent {
    static eventName = "player.murder" as const;
    eventName = "player.murder" as const;

    /**
     * The victim of the murder.
     */
    victim: PlayerData;

    constructor(room: Hostable<any>, player: PlayerData, victim: PlayerData) {
        super(room, player);

        this.victim = victim;
    }
}
