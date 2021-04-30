import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when the host updates the start counter at the bottom of the screen before the game starts.
 */
export class PlayerSetStartCounterEvent extends PlayerEvent {
    static eventName = "player.setcounter" as const;
    eventName = "player.setcounter" as const;

    /**
     * The counter, usually between -1 to 5.
     */
    counter: number;

    constructor(room: Hostable<any>, player: PlayerData, counter: number) {
        super(room, player);

        this.counter = counter;
    }
}
