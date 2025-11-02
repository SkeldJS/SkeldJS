import { BasicEvent } from "@skeldjs/events";
import { CheckSporeTriggerMessage, CheckAppearMessage, CheckZiplineMessage } from "@skeldjs/au-protocol";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player (e.g. a phantom) is attempting to appear, and is requesting the host
 * to verify the attempt and actually allow the player to appear. Only emitted if the client is
 * the host.
 * 
 * This event is useful if you want to prevent a player from appearing before it happens.
 * This event doesn't guarantee that the player actually does appear, see
 * {@link PlayerAppearEvent} to listen for that.
 */
export class PlayerCheckAppearEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.checkappear" as const;
    eventName = "player.checkappear" as const;

    private _alteredPlayer: Player<RoomType>;
    private _alteredIsValid: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: CheckAppearMessage | undefined,
        public readonly doAnimation: boolean,
        /**
         * Whether or not this appear would normally be considered valid.
         */
        public readonly isValid: boolean
    ) {
        super();

        this._alteredPlayer = player;
        this._alteredIsValid = isValid;
    }

    /**
     * The player that will appear instead, if altered.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * Change the player that will actually appear.
     */
    setPlayer(player: Player<RoomType>) {
        this._alteredPlayer = player;
    }

    /**
     * Whether or not this player actually appear instead, if altered.
     */
    get alteredIsValid() {
        return this._alteredIsValid;
    }

    /**
     * Change whether this appear should be consider valid. If valid, this player
     * will appear.
     * @param isValid Whether or not this appear should be considered valid.
     */
    setValid(isValid: boolean) {
        this._alteredIsValid = isValid;
    }
}
