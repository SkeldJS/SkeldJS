import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when the host updates the impostors in the game.
 */
export class PlayerSetImpostorsEvent extends PlayerEvent {
    static eventName = "player.setimpostors" as const;
    eventName = "player.setimpostors" as const;

    /**
     * The impostors that the host set.
     */
    impostors: PlayerData[];

    constructor(room: Hostable<any>, player: PlayerData, impostors: PlayerData[]) {
        super(room, player);

        this.impostors = impostors;
    }
}
