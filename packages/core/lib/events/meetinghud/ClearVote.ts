import { BasicEvent } from "@skeldjs/events";
import { ClearVoteMessage } from "@skeldjs/protocol";

import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerVoteState } from "../../misc/PlayerVoteState";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { MeetingHudEvent } from "./MeetingHudEvent";

export class MeetingHudClearVoteEvent extends BasicEvent implements RoomEvent, MeetingHudEvent, ProtocolEvent {
    static eventName = "meetinghud.clearvote" as const;
    eventName = "meetinghud.clearvote" as const;

    constructor(
        public readonly room: Hostable,
        public readonly meetinghud: MeetingHud,
        public readonly message: ClearVoteMessage|undefined,
        public readonly player: PlayerVoteState
    ) {
        super();
    }
}
