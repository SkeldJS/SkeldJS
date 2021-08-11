import { BasicEvent } from "@skeldjs/events";
import { ClearVoteMessage } from "@skeldjs/protocol";

import { MeetingHud } from "../../objects";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { MeetingHudEvent } from "./MeetingHudEvent";

/**
 * Emitted when a player's vote is cleared.
 */
export class MeetingHudClearVoteEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, MeetingHudEvent, ProtocolEvent {
    static eventName = "meeting.clearvote" as const;
    eventName = "meeting.clearvote" as const;

    constructor(
        public readonly room: RoomType,
        public readonly meetinghud: MeetingHud<RoomType>,
        public readonly message: ClearVoteMessage|undefined,
        /**
         * The player that had their vote cleared.
         */
        public readonly player: PlayerData<RoomType>
    ) {
        super();
    }
}