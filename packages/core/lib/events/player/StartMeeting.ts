import { BasicEvent } from "@skeldjs/events";
import { StartMeetingMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player (i.e. the host of the room) starts a meeting.
 */
export class PlayerStartMeetingEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.startmeeting" as const;
    eventName = "player.startmeeting" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: StartMeetingMessage|undefined,
        /**
         * The player of the body that was reported, or "emergency" if the
         * meeting is an emergency meeting.
         */
        public readonly body: PlayerData<RoomType>|"emergency"
    ) {
        super();
    }
}
