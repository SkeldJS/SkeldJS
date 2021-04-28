import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

import { TaskState } from "../../misc/PlayerGameData";

/**
 * Emitted when a player completes a task.
 */
export class PlayerCompleteTaskEvent extends PlayerEvent {
    static eventName = "player.completetask" as const;
    eventName = "player.completetask" as const;

    /**
     * The task that the player completed.
     */
    task: TaskState;

    constructor(room: Hostable<any>, player: PlayerData, task: TaskState) {
        super(room, player);

        this.task = task;
    }
}
