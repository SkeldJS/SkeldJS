import { RevertableEvent } from "@skeldjs/events";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player's protection by a guardian angel ends, either by running
 * out of time or attempted to be murdered by an impostor.
 *
 * See {@link PlayerProtectEvent} to listen for when a player gets protected
 * initially.
 */
export class PlayerRemoveProtectionEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, PlayerEvent {
    static eventName = "player.removeprotection" as const;
    eventName = "player.removeprotection" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        /**
         * Whether or not the player ran out of protection because of a murder attempt.
         */
        public readonly murderAttempt: boolean
    ) {
        super();
    }
}
