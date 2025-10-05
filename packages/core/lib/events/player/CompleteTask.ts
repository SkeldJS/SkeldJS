import { BasicEvent } from "@skeldjs/events";
import { CompleteTaskMessage } from "@skeldjs/protocol";

import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { TaskState } from "../../objects";

/**
 * Emitted when a player completes one of their tasks.
 */
export class PlayerCompleteTaskEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.completetask" as const;
    eventName = "player.completetask" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: CompleteTaskMessage | undefined,
        /**
         * The state of the task that the player completed.
         */
        public readonly task: TaskState
    ) {
        super();
    }
}
