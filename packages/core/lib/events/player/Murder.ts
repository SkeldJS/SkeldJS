import { BasicEvent } from "@skeldjs/events";
import { MurderPlayerMessage } from "@skeldjs/protocol";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player murders another player.
 *
 * Due to technical limitations, this event cannot be  reverted without advanced
 * "breaking game", therefore it is out of scope of a single `.revert()` function.
 * However, see {@link PlayerCheckMurderEvent} to see about canceling a murder
 * before it happens if you are the host.
 */
export class PlayerMurderEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.murder" as const;
    eventName = "player.murder" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: MurderPlayerMessage|undefined,
        /**
         * The player that was murdered.
         */
        public readonly victim: PlayerData<RoomType>
    ) {
        super();
    }
}
