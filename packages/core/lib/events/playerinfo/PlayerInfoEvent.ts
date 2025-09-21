import { NetworkedPlayerInfo } from "../../objects";

export interface PlayerInfoEvent {
    /**
     * The gamedata object that this event is for.
     */
    playerInfo: NetworkedPlayerInfo;
}
