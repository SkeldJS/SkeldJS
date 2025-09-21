import { BasicEvent } from "@skeldjs/events";
import { RoomEvent } from "../RoomEvent";
import { Hostable } from "../../Hostable";
import { NetworkedPlayerInfo, TaskState } from "../../objects";
import { PlayerInfoEvent } from "./PlayerInfoEvent";

/**
 * Emitted when a player's tasks are set.
 */
export class PlayerInfoSetTasksEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerInfoEvent {
    static eventName = "gamedata.settasks" as const;
    eventName = "gamedata.settasks" as const;

    private _alteredTasks: TaskState[];

    constructor(
        public readonly room: RoomType,
        /**
         * Information about the player that had their tasks set.
         */
        public readonly playerInfo: NetworkedPlayerInfo<RoomType>,
        /**
         * The player's old tasks.
         */
        public readonly oldTasks: TaskState[],
        /**
         * The player's new tasks that were just set.
         */
        public readonly newTasks: TaskState[]
    ) {
        super();

        this._alteredTasks = newTasks;
    }

    /**
     * The alternate tasks to set the player, if changed.
     */
    get alteredTasks() {
        return this._alteredTasks;
    }

    /**
     * Set the tasks to the tasks that the player had before this event.
     */
    revert() {
        this._alteredTasks = this.oldTasks;
    }

    /**
     * Change the tasks of the player that were set.
     * @param tasks Each {@link TaskType} to set the player.
     */
    setTasks(tasks: number[]) {
        this._alteredTasks = tasks.map(task => new TaskState(task, false));
    }
}
