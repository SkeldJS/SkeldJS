import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

import { TaskState } from "../../misc/PlayerGameData";

export class PlayerCompleteTaskEvent extends PlayerEvent {
    static eventName = "player.completetask" as const;
    eventName = "player.completetask" as const;

    task: TaskState;

    constructor(room: Hostable<any>, player: PlayerData, task: TaskState) {
        super(room, player);

        this.task = task;
    }
}
