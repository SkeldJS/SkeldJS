import { BasicEvent } from "@skeldjs/events";
import { Skin } from "@skeldjs/constant";
import { SetSkinMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerSetSkinEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setskin" as const;
    eventName = "player.setskin" as const;

    private _alteredSkin: Skin;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: SetSkinMessage|undefined,
        public readonly oldSkin: Skin,
        public readonly newSkin: Skin
    ) {
        super();

        this._alteredSkin = newSkin;
    }

    get alteredSkin() {
        return this._alteredSkin;
    }

    revert() {
        this.setSkin(this.oldSkin);
    }

    setSkin(skin: Skin) {
        this._alteredSkin = skin;
    }
}
