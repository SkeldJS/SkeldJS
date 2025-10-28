import { BasicEvent } from "@skeldjs/events";
import { UseZiplineMessage } from "@skeldjs/protocol";

import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";

/**
 * Emitted when a player has their player pet updated.
 */
export class PlayerUseZiplineEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.usezipline" as const;
    eventName = "player.usezipline" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: UseZiplineMessage | undefined,
        /**
         * The pet that the player had before.
         */
        public readonly fromTop: boolean,
    ) {
        super();
    }
}
