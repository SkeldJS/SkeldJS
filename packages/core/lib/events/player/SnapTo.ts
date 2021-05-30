import { BasicEvent } from "@skeldjs/events";
import { SnapToMessage } from "@skeldjs/protocol";
import { Vector2 } from "@skeldjs/util";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerSnapToEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.snapto" as const;
    eventName = "player.snapto" as const;

    private _alteredPosition: Vector2;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: SnapToMessage,
        public readonly oldPosition: Vector2,
        public readonly newPosition: Vector2
    ) {
        super();

        this._alteredPosition = new Vector2(newPosition);
    }

    get alteredPosition() {
        return this._alteredPosition;
    }

    revert() {
        this.setPosition(this.oldPosition);
    }

    setPosition(position: Vector2) {
        this._alteredPosition.x = position.x;
        this._alteredPosition.y = position.y;
    }
}
