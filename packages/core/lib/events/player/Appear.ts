import { CancelableEvent } from "@skeldjs/events";
import { PetMessage, AppearMessage } from "@skeldjs/au-protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player (e.g. a phantom) appears.
 */
export class PlayerAppearEvent<RoomType extends StatefulRoom> extends CancelableEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.appear" as const;
    eventName = "player.appear" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: AppearMessage | undefined
    ) {
        super();
    }
}
