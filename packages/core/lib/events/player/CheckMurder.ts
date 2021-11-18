import { BasicEvent } from "@skeldjs/events";
import { CheckMurderMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player is attempting to murder another player, and is requesting
 * the host to verify the attempt and actually murder the player. Only admitted
 * if the client is the host.
 *
 * This event is useful if you want to prevent a murder from actually happening,
 * before it happens. Therefore this event doesn't guarantee that the victim is
 * actually dead, see {@link PlayerMurderEvent} to listen for that.
 */
export class PlayerCheckMurderEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.checkmurder" as const;
    eventName = "player.checkmurder" as const;

    private _alteredPlayer: PlayerData<RoomType>;
    private _alteredVictim: PlayerData<RoomType>;
    private _alteredIsValid: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: CheckMurderMessage|undefined,
        /**
         * The other player that the player is attempting to murder.
         */
        public readonly victim: PlayerData<RoomType>,
        /**
         * Whether or not this murder would normally be considered valid and thus
         * the player be murdered.
         */
        public readonly isValid: boolean
    ) {
        super();

        this._alteredPlayer = player;
        this._alteredVictim = victim;
        this._alteredIsValid = isValid;
    }

    /**
     * The player that will murder the victim instead, if altered.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * Change the player that will actually murder the victim.
     */
    setPlayer(player: PlayerData<RoomType>) {
        this._alteredPlayer = player;
    }

    /**
     * The player that will murdered instead, if altered.
     */
    get alteredVictim() {
        return this._alteredVictim;
    }

    /**
     * Change the player that will actually be murdered.
     * @param victim The player to murder.
     */
    setVictim(victim: PlayerData<RoomType>) {
        this._alteredVictim = victim;
    }

    /**
     * Whether or not this murder will be considered valid instead, if altered.
     */
    get alteredIsValid() {
        return this._alteredIsValid;
    }

    /**
     * Change whether this murder should be consider valid. If valid, ths player
     * will indeed be murdered.
     * @param isValid Whether or not this murder should be considered valid.
     */
    setValid(isValid: boolean) {
        this._alteredIsValid = isValid;
    }
}
