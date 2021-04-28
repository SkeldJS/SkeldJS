import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";

export class GameDataEvent extends RoomEvent {
    gamedata: GameData;

    constructor(room: Hostable<any>, gamedata: GameData) {
        super(room);

        this.gamedata = gamedata;
    }
}
