import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerGameData } from "../../misc/PlayerGameData";
import { GameDataEvent } from "./GameDataEvent";

export class GameDataRemovePlayerEvent extends GameDataEvent {
    static eventName = "gamedata.removeplayer" as const;
    eventName = "gamedata.removeplayer" as const;

    player: PlayerGameData;

    constructor(room: Hostable<any>, gamedata: GameData, player: PlayerGameData) {
        super(room, gamedata);

        this.player = player;
    }
}
