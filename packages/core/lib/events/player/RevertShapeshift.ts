import { RevertableEvent } from "@skeldjs/events";
import { ProtectPlayerMessage } from "@skeldjs/protocol";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player (who is a shapeshifter) shapeshifts back into their own
 * form after being shapeshifted as another play for some duration of time.
 *
 * Use {@link PlayerShapeshiftEvent} to listen for when a player actually shapeshifts
 * initially.
 */
export class PlayerRevertShapeshiftEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.revertshapeshift" as const;
    eventName = "player.revertshapeshift" as const;

    private _alteredDoAnimation: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: ProtectPlayerMessage|undefined,
        /**
         * The player that the player shapeshifted from.
         */
        public readonly target: PlayerData<RoomType>,
        /**
         * Whether or not to show an animation of the player shapeshifting.
         */
        public readonly doAnimation: boolean
    ) {
        super();

        this._alteredDoAnimation = doAnimation;
    }

    /**
     * Whether or not to show an animation of the player shapeshifting instead, if altered.
     */
    get alteredDoAnimation() {
        return this._alteredDoAnimation;
    }

    /**
     * Change whether or not an animation will show the player shapeshifting.
     * @param doAnimation Whether or not to do show an animation of the player shape shifting.
     */
    setDoAnimation(doAnimation: boolean) {
        this._alteredDoAnimation = doAnimation;
    }
}
