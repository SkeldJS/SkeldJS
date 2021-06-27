import { BasicEvent } from "@skeldjs/events";
import { ClearVoteMessage } from "@skeldjs/protocol";

import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { MeetingHudEvent } from "./MeetingHudEvent";

/**
 * Emitted when a player's vote is cleared.
 */
export class MeetingHudClearVoteEvent extends BasicEvent implements RoomEvent, MeetingHudEvent, ProtocolEvent {
    static eventName = "meeting.clearvote" as const;
    eventName = "meeting.clearvote" as const;

    constructor(
        public readonly room: Hostable,
        public readonly meetinghud: MeetingHud,
        public readonly message: ClearVoteMessage|undefined,
        /**
         * The player that had their vote cleared.
         */
        public readonly player: PlayerData
    ) {
        super();
    }
}
