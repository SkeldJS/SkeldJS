import { BasicEvent } from "@skeldjs/events";
import { CompleteTaskMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { TaskState } from "../../misc/PlayerInfo";

/**
 * Emitted when a player completes one of their tasks.
 */
export class PlayerCompleteTaskEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.completetask" as const;
    eventName = "player.completetask" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: CompleteTaskMessage|undefined,
        /**
         * The state of the task that the player completed.
         */
        public readonly task: TaskState
    ) {
        super();
    }
}
