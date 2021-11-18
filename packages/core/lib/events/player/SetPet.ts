import { BasicEvent } from "@skeldjs/events";
import { SetPetMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player has their player pet updated.
 */
export class PlayerSetPetEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setpet" as const;
    eventName = "player.setpet" as const;

    private _alteredPetId: string;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetPetMessage|undefined,
        /**
         * The pet that the player had before.
         */
        public readonly oldPetId: string,
        /**
         * The new pet that the player has.
         */
        public readonly newPetId: string
    ) {
        super();

        this._alteredPetId = newPetId;
    }

    /**
     * The altered pet that the player will have set instead, if changed.
     */
    get alteredPetId() {
        return this._alteredPetId;
    }

    /**
     * Revert the player's pet back to their old pet.
     */
    revert() {
        this.setPet(this.oldPetId);
    }

    /**
     * Change the pet that the player had set.
     * @param pet The pet to set.
     */
    setPet(pet: string) {
        this._alteredPetId = pet;
    }
}
