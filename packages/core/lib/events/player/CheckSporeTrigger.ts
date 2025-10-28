import { BasicEvent } from "@skeldjs/events";
import { CheckSporeTriggerMessage, CheckZiplineMessage } from "@skeldjs/protocol";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player is attempting to trigger a spore, and is requesting the host
 * to verify the attempt and actually trigger the spore. Only emitted if the client is
 * the host.
 * 
 * This event is useful if you want to prevent a player from triggering a spore before it happens.
 * This event doesn't guarantee that the spore actually does get triggered, see
 * {@link PlayerTriggerSporesEvent} to listen for that.
 */
export class PlayerCheckSporeTriggerEvent<RoomType extends StatefulRoom> extends BasicEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.checksporetrigger" as const;
    eventName = "player.checksporetrigger" as const;

    private _alteredPlayer: Player<RoomType>;
    private _alteredMushroomId: number;
    private _alteredIsValid: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: CheckSporeTriggerMessage | undefined,
        public readonly mushroomId: number,
        /**
         * Whether or not this spore trigger would normally be considered valid.
         */
        public readonly isValid: boolean
    ) {
        super();

        this._alteredPlayer = player;
        this._alteredMushroomId = mushroomId;
        this._alteredIsValid = isValid;
    }

    /**
     * The player that will trigger the spore instead, if altered.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * Change the player that will actually trigger the spore.
     */
    setPlayer(player: Player<RoomType>) {
        this._alteredPlayer = player;
    }

    get alteredMushroomId() {
        return this._alteredMushroomId;
    }

    setMushroomId(mushroomId: number) {
        this._alteredMushroomId = mushroomId;
    }

    /**
     * Whether or not this spore trigger will be considered valid instead, if altered.
     */
    get alteredIsValid() {
        return this._alteredIsValid;
    }

    /**
     * Change whether this spore trigger should be consider valid. If valid, this player
     * will trigger the spore.
     * @param isValid Whether or not this spore trigger should be considered valid.
     */
    setValid(isValid: boolean) {
        this._alteredIsValid = isValid;
    }
}
