import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerGameData } from "../../misc/PlayerGameData";
import { GameDataEvent } from "./GameDataEvent";

/**
 * Emitted when the host updates tasks for a player.
 */
export class GameDataSetTasksEvent extends GameDataEvent {
    static eventName = "gamedata.settasks" as const;
    eventName = "gamedata.settasks" as const;

    /**
     * The data of the player that had their tasks set.
     */
    player: PlayerGameData;

    /**
     * The IDs of the tasks that the player was set.
     */
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
