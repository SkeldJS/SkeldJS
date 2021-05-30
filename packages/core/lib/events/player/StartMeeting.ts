import { BasicEvent } from "@skeldjs/events";
import { StartMeetingMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerStartMeetingEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.startmeeting" as const;
    eventName = "player.startmeeting" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: StartMeetingMessage|undefined,
        public readonly body: PlayerData|"emergency"
    ) {
        super();
    }
}
