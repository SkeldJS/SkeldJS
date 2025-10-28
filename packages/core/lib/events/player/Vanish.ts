import { CancelableEvent } from "@skeldjs/events";
import { PetMessage, VanishMessage } from "@skeldjs/protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player (e.g. a phantom) vanishes.
 */
export class PlayerVanishEvent<RoomType extends StatefulRoom> extends CancelableEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.vanish" as const;
    eventName = "player.vanish" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: VanishMessage | undefined
    ) {
        super();
    }
}
