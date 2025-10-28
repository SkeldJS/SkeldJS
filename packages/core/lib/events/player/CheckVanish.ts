import { BasicEvent } from "@skeldjs/events";
import { CheckSporeTriggerMessage, CheckVanishMessage, CheckZiplineMessage } from "@skeldjs/protocol";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player (e.g. a phantom) is attempting to vanish, and is requesting the host
 * to verify the attempt and actually allow the player to vanish. Only emitted if the client is
 * the host.
 * 
 * This event is useful if you want to prevent a player from vanishing before it happens.
 * This event doesn't guarantee that the player actually does vanish, see
 * {@link PlayerVanishEvent} to listen for that.
 */
export class PlayerCheckVanishEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.checkvanish" as const;
    eventName = "player.checkvanish" as const;

    private _alteredPlayer: Player<RoomType>;
    private _alteredIsValid: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: CheckVanishMessage | undefined,
        public readonly maxDuration: number,
        /**
         * Whether or not this vanish would normally be considered valid.
         */
        public readonly isValid: boolean
    ) {
        super();

        this._alteredPlayer = player;
        this._alteredIsValid = isValid;
    }

    /**
     * The player that will vanish instead, if altered.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * Change the player that will actually vanish.
     */
    setPlayer(player: Player<RoomType>) {
        this._alteredPlayer = player;
    }

    /**
     * Whether or not this player actually vanish instead, if altered.
     */
    get alteredIsValid() {
        return this._alteredIsValid;
    }

    /**
     * Change whether this vanish should be consider valid. If valid, this player
     * will vanish.
     * @param isValid Whether or not this vanish should be considered valid.
     */
    setValid(isValid: boolean) {
        this._alteredIsValid = isValid;
    }
}
