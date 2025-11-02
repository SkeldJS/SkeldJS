import { BasicEvent } from "@skeldjs/events";
import { CheckShapeshiftMessage } from "@skeldjs/au-protocol";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player (i.e. a shapeshifter) is attempting to shapeshift into another
 * player, and is requesting the host to verify the attempt and actually shapeshift
 * into that player. Only emitted if the client is the host.
 *
 * This event is useful if you want to prevent a shapeshift from actually happening,
 * before it happens. Therefore this event doesn't guarantee that the shapeshift actually
 * takes place, see {@link PlayerShapeshiftEvent} to listen for that.
 */
export class PlayerCheckShapeshiftEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.checkshapeshift" as const;
    eventName = "player.checkshapeshift" as const;

    private _alteredPlayer: Player<RoomType>;
    private _alteredTarget: Player<RoomType>;
    private _alteredIsValid: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: CheckShapeshiftMessage | undefined,
        /**
         * The other player that the player is attempting to shapeshift.
         */
        public readonly target: Player<RoomType>,
        /**
         * Whether or not this shapeshift would normally be considered valid and thus
         * the player be shapeshifted.
         */
        public readonly isValid: boolean
    ) {
        super();

        this._alteredPlayer = player;
        this._alteredTarget = target;
        this._alteredIsValid = isValid;
    }

    /**
     * The player that will shapeshift into the target instead, if altered.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * Change the player that will actually shapeshift into the target.
     */
    setPlayer(player: Player<RoomType>) {
        this._alteredPlayer = player;
    }

    /**
     * The player that will shapeshifted instead, if altered.
     */
    get alteredTarget() {
        return this._alteredTarget;
    }

    /**
     * Change the player that will actually be shapeshifted into.
     * @param target The player to shapeshift into.
     */
    setTarget(target: Player<RoomType>) {
        this._alteredTarget = target;
    }

    /**
     * Whether or not this shapeshift will be considered valid instead, if altered.
     */
    get alteredIsValid() {
        return this._alteredIsValid;
    }

    /**
     * Change whether this shapeshift should be consider valid. If valid, this player
     * will shapeshift.
     * @param isValid Whether or not this shapeshift should be considered valid.
     */
    setValid(isValid: boolean) {
        this._alteredIsValid = isValid;
    }
}
