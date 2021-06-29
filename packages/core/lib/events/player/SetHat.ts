import { BasicEvent } from "@skeldjs/events";
import { Hat } from "@skeldjs/constant";
import { SetHatMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player has their player hat updated.
 */
export class PlayerSetHatEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.sethat" as const;
    eventName = "player.sethat" as const;

    private _atleredHat: Hat;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetHatMessage|undefined,
        /**
         * The hat that the player had before.
         */
        public readonly oldHat: Hat,
        /**
         * The new hat that the player has.
         */
        public readonly newHat: Hat
    ) {
        super();

        this._atleredHat = newHat;
    }

    /**
     * The altered hat that the player will have set instead, if changed.
     */
    get alteredHat() {
        return this._atleredHat;
    }

    /**
     * Revert the player's hat back to their old hat.
     */
    revert() {
        this.setHat(this.oldHat);
    }

    /**
     * Change the hat that the player had set.
     * @param hat The hat to set.
     */
    setHat(hat: Hat) {
        this._atleredHat = hat;
    }
}
