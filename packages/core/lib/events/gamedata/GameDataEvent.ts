import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class GameDataEvent extends RoomEvent {
    /**
     * The game data object in question.
     */
    gamedata: GameData;

    constructor(room: Hostable<any>, gamedata: GameData) {
        super(room);

        this.gamedata = gamedata;
    }
}
