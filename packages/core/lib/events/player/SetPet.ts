import { Pet } from "@skeldjs/constant";

import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player updates their pet.
 */
export class PlayerSetPetEvent extends PlayerEvent {
    static eventName = "player.setpet" as const;
    eventName = "player.setpet" as const;

    /**
     * The pet of the player.
     */
    pet: Pet;

    constructor(room: Hostable<any>, player: PlayerData, pet: Pet) {
        super(room, player);

        this.pet = pet;
    }
}
