import { BasicEvent } from "@skeldjs/events";
import { ClimbLadderMessage } from "@skeldjs/protocol";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerClimbLadderEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.climbladder" as const;
    eventName = "player.climbladder" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: ClimbLadderMessage|undefined,
        public readonly ladderid: number
    ) {
        super();
    }
}
