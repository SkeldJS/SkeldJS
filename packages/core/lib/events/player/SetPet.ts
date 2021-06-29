import { BasicEvent } from "@skeldjs/events";
import { Pet } from "@skeldjs/constant";
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

    private _alteredPet: Pet;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetPetMessage|undefined,
        /**
         * The pet that hte player had before.
         */
        public readonly oldPet: Pet,
        /**
         * The new pet that the player has.
         */
        public readonly newPet: Pet
    ) {
        super();

        this._alteredPet = newPet;
    }

    /**
     * The altered pet that the player will have set instead, if changed.
     */
    get alteredPet() {
        return this._alteredPet;
    }

    /**
     * Revert the player's pet back to their old pet.
     */
    revert() {
        this.setPet(this.oldPet);
    }

    /**
     * Change the pet that the player had set.
     * @param pet The pet to set.
     */
    setPet(pet: Pet) {
        this._alteredPet = pet;
    }
}
