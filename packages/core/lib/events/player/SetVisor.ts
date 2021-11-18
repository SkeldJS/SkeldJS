import { BasicEvent } from "@skeldjs/events";
import { SetVisorMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player has their player visor updated.
 */
export class PlayerSetVisorEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setvisor" as const;
    eventName = "player.setvisor" as const;

    private _alteredVisorId: string;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetVisorMessage|undefined,
        /**
         * The visor that the player had before.
         */
        public readonly oldVisorId: string,
        /**
         * The new visor that the player has.
         */
        public readonly newVisorId: string
    ) {
        super();

        this._alteredVisorId = newVisorId;
    }

    /**
     * The altered visor that the player will have set instead, if changed.
     */
    get alteredVisorId() {
        return this._alteredVisorId;
    }

    /**
     * Revert the player's visor back to their old visor.
     */
    revert() {
        this.setVisor(this.oldVisorId);
    }

    /**
     * Change the visor that the player had set.
     * @param visor The visor to set.
     */
    setVisor(visor: string) {
        this._alteredVisorId = visor;
    }
}
