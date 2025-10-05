import { CancelableEvent } from "@skeldjs/events";
import { CheckNameMessage } from "@skeldjs/protocol";

import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";

/**
 * Emitted when a player requests to have their name set. Only emitted if the
 * client is the host.
 */
export class PlayerCheckNameEvent<RoomType extends StatefulRoom> extends CancelableEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.checkname" as const;
    eventName = "player.checkname" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: CheckNameMessage | undefined,
        /**
         * The original name that the player asked for.
         */
        public readonly originalName: string,
        /**
         * The altered name, i.e. the original name was taken.
         */
        public alteredName: string
    ) {
        super();
    }

    /**
     * Change the altered name for the player to have set.
     * @param name The name to set.
     */
    setName(name: string) {
        this.alteredName = name;
    }
}
