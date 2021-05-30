import { BasicEvent } from "@skeldjs/events";
import { Hat } from "@skeldjs/constant";
import { SetHatMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerSetHatEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.sethat" as const;
    eventName = "player.sethat" as const;

    private _atleredHat: Hat;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: SetHatMessage|undefined,
        public readonly oldHat: Hat,
        public readonly newHat: Hat
    ) {
        super();

        this._atleredHat = newHat;
    }

    get alteredHat() {
        return this._atleredHat;
    }

    revert() {
        this.setHat(this.oldHat);
    }

    setHat(hat: Hat) {
        this._atleredHat = hat;
    }
}
