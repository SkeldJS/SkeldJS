import { BasicEvent } from "@skeldjs/events";
import { TriggerSporesMessage, UseZiplineMessage } from "@skeldjs/au-protocol";

import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";

/**
 * Emitted when a player has their player pet updated.
 */
export class PlayerTriggerSporesEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.triggerspores" as const;
    eventName = "player.triggerspores" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: TriggerSporesMessage | undefined,
        public readonly mushroomId: number,
    ) {
        super();
    }
}
