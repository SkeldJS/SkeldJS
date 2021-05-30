import { PlayerData } from "../../PlayerData";

export interface PlayerEvent {
    /**
     * The player that this event is associated with.
     */
    player: PlayerData;
}
