import { Player } from "../../Player";

export interface PlayerEvent {
    /**
     * The player that this event is for.
     */
    player: Player;
}
