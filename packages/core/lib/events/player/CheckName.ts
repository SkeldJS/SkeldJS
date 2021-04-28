import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player asks the host to check and set a name.
 *
 * Only received if the current client is the host of the room.
 */
export class PlayerCheckNameEvent extends PlayerEvent {
    static eventName = "player.checkname" as const;
    eventName = "player.checkname" as const;

    /**
     * The name that the player is requesting.
     */
    name: string;

    constructor(room: Hostable<any>, player: PlayerData, name: string) {
        super(room, player);

        this.name = name;
    }

    setName(name: string) {
        this.name = name;
    }
}
