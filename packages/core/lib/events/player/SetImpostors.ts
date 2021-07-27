import { BasicEvent } from "@skeldjs/events";
import { SetInfectedMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player (i.e. the host of the room) updates the impostor in the
 * room.
 */
export class PlayerSetImpostorsEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setimpostors" as const;
    eventName = "player.setimpostors" as const;

    private _alteredImpostors: PlayerData<RoomType>[];
    private _isDirty: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetInfectedMessage|undefined,
        /**
         * The players that were made impostors.
         */
        public readonly impostors: PlayerData<RoomType>[]
    ) {
        super();

        this._alteredImpostors = [...impostors];
        this._isDirty = false;
    }

    /**
     * The changed impostors that will be set instead, if changed.
     */
    get alteredImpostors() {
        return this._alteredImpostors;
    }

    /**
     * Whether the {@link PlayerSetImpostorsEvent.alteredImpostors} is different from
     * {@link PlayerSetImpostorsEvent.impostors}.
     */
    get isDirty() {
        return this._isDirty;
    }

    /**
     * Change the impostors that were set.
     * @param impostors The impostors to set.
     */
    setImpostors(impostors: PlayerData<RoomType>[]) {
        this._alteredImpostors = impostors;
        this._isDirty = true;
    }
}
