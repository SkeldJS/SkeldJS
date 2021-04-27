import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerGameData, TaskState } from "../../misc/PlayerGameData";
import { GameDataEvent } from "./GameDataEvent";

export class GameDataSetTasksEvent extends GameDataEvent {
    static eventName = "gamedata.settasks" as const;
    eventName = "gamedata.settasks" as const;

    player: PlayerGameData;
    tasks: TaskState[];

    constructor(
        room: Hostable,
        gamedata: GameData,
        player: PlayerGameData,
        tasks: TaskState[]
    ) {
        super(room, gamedata);

        this.player = player;
        this.tasks = tasks;
    }
}
