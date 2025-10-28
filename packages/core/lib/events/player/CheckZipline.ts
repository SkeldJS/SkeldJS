import { BasicEvent } from "@skeldjs/events";
import { CheckZiplineMessage } from "@skeldjs/protocol";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player is attempting to use a zipline, and is requesting the host
 * to verify the attempt and actually use the zipline. Only emitted if the client is
 * the host.
 * 
 * This event is useful if you want to prevent a player from ziplining before it happens.
 * This event doesn't guarantee that the zipeline use actually takes place, see
 * {@link PlayerUseZiplineEvent} to listen for that.
 */
export class PlayerCheckZiplineEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.checkzipline" as const;
    eventName = "player.checkzipline" as const;

    private _alteredPlayer: Player<RoomType>;
    private _alteredFromTop: boolean;
    private _alteredIsValid: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: CheckZiplineMessage | undefined,
        public readonly fromTop: boolean,
        /**
         * Whether or not this zipline would normally be considered valid.
         */
        public readonly isValid: boolean
    ) {
        super();

        this._alteredPlayer = player;
        this._alteredFromTop = fromTop;
        this._alteredIsValid = isValid;
    }

    /**
     * The player that will use the zipline instead, if altered.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * Change the player that will actually use the zipline.
     */
    setPlayer(player: Player<RoomType>) {
        this._alteredPlayer = player;
    }

    get alteredFromTop() {
        return this._alteredFromTop;
    }

    setFromTop(fromTop: boolean) {
        this._alteredFromTop = fromTop;
    }

    /**
     * Whether or not this zipline use will be considered valid instead, if altered.
     */
    get alteredIsValid() {
        return this._alteredIsValid;
    }

    /**
     * Change whether this zipline use should be consider valid. If valid, this player
     * will use the zipline.
     * @param isValid Whether or not this zipline use should be considered valid.
     */
    setValid(isValid: boolean) {
        this._alteredIsValid = isValid;
    }
}
