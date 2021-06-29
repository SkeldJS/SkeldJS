import { BasicEvent } from "@skeldjs/events";
import { Skin } from "@skeldjs/constant";
import { SetSkinMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player has their player skin updated.
 */
export class PlayerSetSkinEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setskin" as const;
    eventName = "player.setskin" as const;

    private _alteredSkin: Skin;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetSkinMessage|undefined,
        /**
         * The skin that the player had before.
         */
        public readonly oldSkin: Skin,
        /**
         * The new skin that the player has.
         */
        public readonly newSkin: Skin
    ) {
        super();

        this._alteredSkin = newSkin;
    }

    /**
     * The altered skin that the player will have set instead, if changed.
     */
    get alteredSkin() {
        return this._alteredSkin;
    }

    /**
     * Revert the player's skin back to their old skin.
     */
    revert() {
        this.setSkin(this.oldSkin);
    }

    /**
     * Change the skin that the player had set.
     * @param skin The skin to set.
     */
    setSkin(skin: Skin) {
        this._alteredSkin = skin;
    }
}
