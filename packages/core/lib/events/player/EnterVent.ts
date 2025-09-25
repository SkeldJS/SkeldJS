import { BasicEvent } from "@skeldjs/events";
import { EnterVentMessage } from "@skeldjs/protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";

import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player goes into a vent.
 */
export class PlayerEnterVentEvent<RoomType extends StatefulRoom = StatefulRoom> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.entervent" as const;
    eventName = "player.entervent" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: EnterVentMessage | undefined,
        /**
         * The ID of the vent that the player went into.
         */
        public readonly ventId: number
    ) {
        super();
    }
}
