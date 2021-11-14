import { BasicEvent } from "@skeldjs/events";
import { ClimbLadderMessage } from "@skeldjs/protocol";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player climbs a ladder on the map.
 */
export class PlayerClimbLadderEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.climbladder" as const;
    eventName = "player.climbladder" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: ClimbLadderMessage|undefined,
        /**
         * The ID of the ladder that the player climbed.
         */
        public readonly ladderId: number
    ) {
        super();
    }
}
