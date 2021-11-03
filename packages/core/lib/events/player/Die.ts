import { RevertableEvent } from "@skeldjs/events";

import { Hostable } from "../../Hostable";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player dies, either by being murdered or being exiled. Unlike
 * {@link PlayerMurderEvent}, this event can be reverted to bring the player back
 * to life, but note that their body will not be removed due to technical
 * limitations.
 */
export class PlayerDieEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, PlayerEvent {
    static eventName = "player.die" as const;
    eventName = "player.die" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        /**
         * Whether or not the player died by being exiled. SkeldJS only uses
         * 'murder' or 'exile', although this can be anything.
         */
        public readonly reason: string
    ) {
        super();
    }
}
