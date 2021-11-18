import { BasicEvent } from "@skeldjs/events";
import { SetNameplateMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player has their player nameplate updated.
 */
export class PlayerSetNameplateEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setnameplate" as const;
    eventName = "player.setnameplate" as const;

    private _alteredNameplateId: string;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetNameplateMessage|undefined,
        /**
         * The nameplate that the player had before.
         */
        public readonly oldNameplateId: string,
        /**
         * The new nameplate that the player has.
         */
        public readonly newNameplateId: string
    ) {
        super();

        this._alteredNameplateId = newNameplateId;
    }

    /**
     * The altered nameplate that the player will have set instead, if changed.
     */
    get alteredNameplateId() {
        return this._alteredNameplateId;
    }

    /**
     * Revert the player's nameplate back to their old nameplate.
     */
    revert() {
        this.setNameplate(this.oldNameplateId);
    }

    /**
     * Change the nameplate that the player had set.
     * @param nameplate The nameplate to set.
     */
    setNameplate(nameplate: string) {
        this._alteredNameplateId = nameplate;
    }
}
