import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player exits a vent.
 */
export class PlayerExitVentEvent extends PlayerEvent {
    static eventName = "player.exitvent" as const;
    eventName = "player.exitvent" as const;

    /**
     * The ID of the vent that the player exited.
     */
    ventid: number;

    constructor(room: Hostable<any>, player: PlayerData, ventid: number) {
        super(room, player);

        this.ventid = ventid;
    }
}
