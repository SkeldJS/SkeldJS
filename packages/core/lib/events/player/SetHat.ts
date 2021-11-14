import { BasicEvent } from "@skeldjs/events";
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

    private _atleredHatId: string;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetHatMessage|undefined,
        /**
         * The hat that the player had before.
         */
        public readonly oldHatId: string,
        /**
         * The new hat that the player has.
         */
        public readonly newHatId: string
    ) {
        super();

        this._atleredHatId = newHatId;
    }

    /**
     * The altered hat that the player will have set instead, if changed.
     */
    get alteredHatId() {
        return this._atleredHatId;
    }

    /**
     * Revert the player's hat back to their old hat.
     */
    revert() {
        this.setHat(this.oldHatId);
    }

    /**
     * Change the hat that the player had set.
     * @param hatId The hat to set.
     */
    setHat(hatId: string) {
        this._atleredHatId = hatId;
    }
}
