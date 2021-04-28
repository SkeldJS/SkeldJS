import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player updates their name.
 */
export class PlayerSetNameEvent extends PlayerEvent {
    static eventName = "player.setname" as const;
    eventName = "player.setname" as const;

    /**
     * The name of the player.
     */
    name: string;

    constructor(room: Hostable<any>, player: PlayerData, name: string) {
        super(room, player);

        this.name = name;
    }
}
