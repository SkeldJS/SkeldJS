import { RevertableEvent } from "@skeldjs/events";
import { ProtectPlayerMessage } from "@skeldjs/au-protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player (who is a shapeshifter) shapeshifts into another player.
 */
export class PlayerShapeshiftEvent<RoomType extends StatefulRoom> extends RevertableEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.shapeshift" as const;
    eventName = "player.shapeshift" as const;

    private _alteredTarget: Player<RoomType>;
    private _alteredDoAnimation: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: ProtectPlayerMessage | undefined,
        /**
         * The target that the player shapeshifted into.
         */
        public readonly target: Player<RoomType>,
        /**
         * The duration, in seconds, for how long the player is shapeshifted for.
         */
        public readonly duration: number,
        /**
         * Whether or not to show an animation of the player shapeshifting.
         */
        public readonly doAnimation: boolean
    ) {
        super();

        this._alteredTarget = target;
        this._alteredDoAnimation = doAnimation;
    }

    /**
     * The player that the player will shapeshift into instead, if altered.
     */
    get alteredTarget() {
        return this._alteredTarget;
    }

    /**
     * Whether or not to show an animation of the player shapeshifting instead, if altered.
     */
    get alteredDoAnimation() {
        return this._alteredDoAnimation;
    }

    /**
     * Change the player that the player will shapeshift into.
     * @param target The player to shapeshift into instead.
     */
    setTarget(target: Player<RoomType>, doAnimation: boolean) {
        this._alteredTarget = target;
        this._alteredDoAnimation = doAnimation;
    }
}
