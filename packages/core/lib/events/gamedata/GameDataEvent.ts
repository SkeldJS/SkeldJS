import { GameData } from "../../objects";

export interface GameDataEvent {
    /**
     * The gamedata object that this event is for.
     */
    gamedata: GameData;
}
