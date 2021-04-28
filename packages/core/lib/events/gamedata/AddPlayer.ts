import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerGameData } from "../../misc/PlayerGameData";
import { GameDataEvent } from "./GameDataEvent";

export class GameDataAddPlayerEvent extends GameDataEvent {
    static eventName = "gamedata.addplayer" as const;
    eventName = "gamedata.addplayer" as const;

    player: PlayerGameData;

    constructor(room: Hostable<any>, gamedata: GameData, player: PlayerGameData) {
        super(room, gamedata);

        this.player = player;
    }
}
