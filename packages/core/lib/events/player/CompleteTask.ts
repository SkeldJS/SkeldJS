import { BasicEvent } from "@skeldjs/events";
import { CompleteTaskMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { TaskState } from "../../misc/PlayerInfo";

export class PlayerCompleteTaskEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.completetask" as const;
    eventName = "player.completetask" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: CompleteTaskMessage|undefined,
        public readonly task: TaskState
    ) {
        super();
    }
}
