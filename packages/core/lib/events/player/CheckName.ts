import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player asks the host to check and set a name.
 *
 * Only received if the current client is the host of the room.
 *
 * @example
 * ```ts
 * // Force a player's name to always end in ' 69'.
 * client.on("gamedata.checkname", ev => {
 *   ev.setName(ev.original + " 69");
 * });
 * ```
 */
export class PlayerCheckNameEvent extends PlayerEvent {
    static eventName = "player.checkname" as const;
    eventName = "player.checkname" as const;

    /**
     * The name that the player is requesting.
     */
    original: string;

    /**
     * The updated name of the player.
     */
    altered: string;

    constructor(room: Hostable<any>, player: PlayerData, name: string, modified: string) {
        super(room, player);

        this.original = name;
        this.altered = modified;
    }

    setName(name: string) {
        this.altered = name;
    }

    revert() {
        this.altered = this.original;
    }
}
