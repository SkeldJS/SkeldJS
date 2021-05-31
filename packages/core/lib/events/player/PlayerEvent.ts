import { PlayerData } from "../../PlayerData";

export interface PlayerEvent {
    /**
     * The player that this event is for.
     */
    player: PlayerData;
}
