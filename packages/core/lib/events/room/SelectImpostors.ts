import { CancelableEvent } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when the room picks which impostors will be selected, after the game
 * is started. Can be canceled to avoid choosing and setting impostors altogether.
 *
 * Mainly emitted in order to allow overriding of the default impostor
 * selection in SkeldJS.
 */
export class RoomSelectImpostorsEvent extends CancelableEvent implements RoomEvent {
    static eventName = "room.selectimpostors" as const;
    eventName = "room.selectimpostors" as const;

    private _alteredImpostors: PlayerData[];

    constructor(
        public readonly room: Hostable,
        /**
         * The players that were chosen to be impostors.
         */
        public readonly impostors: PlayerData[]
    ) {
        super();

        this._alteredImpostors = impostors;
    }

    /**
     * The altered impostor list that will be used instead, if changed.
     */
    get alteredImpostors() {
        return this._alteredImpostors;
    }

    /**
     * Change the players that were selected.
     * @param impostors The players to select.
     */
    setImpostors(impostors: PlayerData[]) {
        this._alteredImpostors = impostors;
    }
}
