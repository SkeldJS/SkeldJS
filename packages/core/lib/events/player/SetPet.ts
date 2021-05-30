import { BasicEvent } from "@skeldjs/events";
import { Pet } from "@skeldjs/constant";
import { SetPetMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerSetPetEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setpet" as const;
    eventName = "player.setpet" as const;

    private _alteredPet: Pet;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: SetPetMessage|undefined,
        public readonly oldPet: Pet,
        public readonly newPet: Pet
    ) {
        super();

        this._alteredPet = newPet;
    }

    get alteredPet() {
        return this._alteredPet;
    }

    revert() {
        this.setPet(this.oldPet);
    }

    setPet(pet: Pet) {
        this._alteredPet = pet;
    }
}
