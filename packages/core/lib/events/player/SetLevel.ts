import { BasicEvent } from "@skeldjs/events";
import { SetHatMessage } from "@skeldjs/protocol";

import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";

/**
 * Emitted when a player has their level updated.
 */
export class PlayerSetLevelEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.setlevel" as const;
    eventName = "player.setlevel" as const;

    private _alteredLevel: number;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: SetHatMessage | undefined,
        /**
         * The level that the player was before.
         */
        public readonly oldLevel: number,
        /**
         * The new level that the player is.
         */
        public readonly newLevel: number
    ) {
        super();

        this._alteredLevel = newLevel;
    }

    /**
     * The altered level that the player will have set instead, if changed.
     */
    get alteredLevel() {
        return this._alteredLevel;
    }

    /**
     * Revert the player's level back to their old level.
     */
    revert() {
        this.setLevel(this.oldLevel);
    }

    /**
     * Change the level that the player had set.
     * @param level The level to set.
     */
    setLevel(level: number) {
        this._alteredLevel = level;
    }
}
