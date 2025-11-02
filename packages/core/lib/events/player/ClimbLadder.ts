import { BasicEvent } from "@skeldjs/events";
import { ClimbLadderMessage } from "@skeldjs/au-protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";

import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player climbs a ladder on the map.
 */
export class PlayerClimbLadderEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.climbladder" as const;
    eventName = "player.climbladder" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: ClimbLadderMessage | undefined,
        /**
         * The ID of the ladder that the player climbed.
         */
        public readonly ladderId: number
    ) {
        super();
    }
}
