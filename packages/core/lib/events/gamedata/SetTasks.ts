import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerGameData } from "../../misc/PlayerGameData";
import { GameDataEvent } from "./GameDataEvent";

export class GameDataSetTasksEvent extends GameDataEvent {
    static eventName = "gamedata.settasks" as const;
    eventName = "gamedata.settasks" as const;

    player: PlayerGameData;
    tasks: number[];

    constructor(
        room: Hostable<any>,
        gamedata: GameData,
        player: PlayerGameData,
        tasks: number[]
    ) {
        super(room, gamedata);

        this.player = player;
        this.tasks = tasks;
    }
}
