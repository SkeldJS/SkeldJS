import { CancelableEvent } from "@skeldjs/events";
import { CheckColorMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { Color } from "@skeldjs/constant";

export class PlayerCheckColorEvent extends CancelableEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.checkcolor" as const;
    eventName = "player.checkcolor" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: CheckColorMessage|undefined,
        public readonly originalColor: Color,
        public alteredColor: Color
    ) {
        super();
    }

    setColor(color: Color) {
        this.alteredColor = color;
    }
}
