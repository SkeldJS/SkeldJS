import { BasicEvent } from "@skeldjs/events";
import { SnapToMessage } from "@skeldjs/protocol";
import { Vector2 } from "@skeldjs/util";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player snaps to a position, without lerping. Typically emitted
 * when the player is moves between vents.
 */
export class PlayerSnapToEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.snapto" as const;
    eventName = "player.snapto" as const;

    private _alteredPosition: Vector2;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SnapToMessage,
        /**
         * The old position of the player.
         */
        public readonly oldPosition: Vector2,
        /**
         * The new position of the player.
         */
        public readonly newPosition: Vector2
    ) {
        super();

        this._alteredPosition = new Vector2(newPosition);
    }

    /**
     * The altered position that the player will snap to instead, if changed.
     */
    get alteredPosition() {
        return this._alteredPosition;
    }

    /**
     * Revert the player's position back to their old position.
     */
    revert() {
        this.setPosition(this.oldPosition);
    }

    /**
     * Set the position that the player was snapped to.
     * @param position The position to snap to.
     */
    setPosition(position: Vector2) {
        this._alteredPosition.x = position.x;
        this._alteredPosition.y = position.y;
    }
}
