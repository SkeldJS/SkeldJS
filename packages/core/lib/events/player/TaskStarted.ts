import { BasicEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player begins a task.
 */
export class PlayerTaskStartedEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType> {
    static eventName = "player.taskstarted" as const;
    eventName = "player.taskstarted" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        /**
         * The index of the task being started.
         */
        public readonly taskIdx: number,
    ) {
        super();
    }
}
