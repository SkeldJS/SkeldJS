import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerGameData } from "../../misc/PlayerGameData";
import { GameDataEvent } from "./GameDataEvent";

/**
 * Emitted when the host updates tasks for a player.
 *
 * @example
 * ```ts
 * // Print the tasks of a player when they get updated.
 * client.on("gamedata.settasks", ev => {
 *   console.log("Player " + ev.player.name + " has task ids: " + ev.tasks.join(", ") + ".");
 * });
 * ```
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
