import { BasicEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player's task progress updates.
 */
export class PlayerTaskProgressEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType> {
    static eventName = "player.taskprogress" as const;
    eventName = "player.taskprogress" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        /**
         * The index of the task being progressed.
         */
        public readonly taskIdx: number,
        /**
         * The current progress amount (0-255 or game-specific).
         */
        public readonly progress: number,
    ) {
        super();
    }
}
