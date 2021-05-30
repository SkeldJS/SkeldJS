import { BasicEvent } from "@skeldjs/events";
import { Color } from "@skeldjs/constant";
import { SetColorMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerSetColorEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setcolor" as const;
    eventName = "player.setcolor" as const;

    private _alteredColor: Color;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: SetColorMessage|undefined,
        public readonly oldColor: Color,
        public readonly newColor: Color
    ) {
        super();

        this._alteredColor = newColor;
    }

    get alteredColor() {
        return this._alteredColor;
    }

    revert() {
        this.setColor(this.oldColor);
    }

    setColor(color: Color) {
        this._alteredColor = color;
    }
}
