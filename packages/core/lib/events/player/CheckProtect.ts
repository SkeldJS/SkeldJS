import { BasicEvent } from "@skeldjs/events";
import { CheckProtectMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player (i.e. a guardian angel) is attempting to protect another
 * player, and is requesting the host to verify the attempt and actually protect
 * the player. Only admitted if the client is the host.
 *
 * This event is useful if you want to prevent a protect from actually happening,
 * before it happens. Therefore this event doesn't guarantee that the target is
 * actually dead, see {@link PlayerProtectEvent} to listen for that.
 */
export class PlayerCheckProtectEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.checkprotect" as const;
    eventName = "player.checkprotect" as const;

    private _alteredPlayer: PlayerData<RoomType>;
    private _alteredTarget: PlayerData<RoomType>;
    private _alteredIsValid: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: CheckProtectMessage|undefined,
        /**
         * The other player that the player is attempting to protect.
         */
        public readonly target: PlayerData<RoomType>,
        /**
         * Whether or not this protect would normally be considered valid and thus
         * the player be protected.
         */
        public readonly isValid: boolean
    ) {
        super();

        this._alteredPlayer = player;
        this._alteredTarget = target;
        this._alteredIsValid = isValid;
    }

    /**
     * The player that will protect the target instead, if altered.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * Change the player that will actually protect the target.
     */
    setPlayer(player: PlayerData<RoomType>) {
        this._alteredPlayer = player;
    }

    /**
     * The player that will protected instead, if altered.
     */
    get alteredTarget() {
        return this._alteredTarget;
    }

    /**
     * Change the player that will actually be protected.
     * @param target The player to protect.
     */
    setTarget(target: PlayerData<RoomType>) {
        this._alteredTarget = target;
    }

    /**
     * Whether or not this protect will be considered valid instead, if altered.
     */
    get alteredIsValid() {
        return this._alteredIsValid;
    }

    /**
     * Change whether this protect should be consider valid. If valid, ths player
     * will indeed be protected.
     * @param isValid Whether or not this protect should be considered valid.
     */
    setValid(isValid: boolean) {
        this._alteredIsValid = isValid;
    }
}
