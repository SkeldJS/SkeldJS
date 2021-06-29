import { BasicEvent } from "@skeldjs/events";
import { SetNameMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player has their player name updated.
 */
export class PlayerSetNameEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setname" as const;
    eventName = "player.setname" as const;

    private _alteredName: string;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetNameMessage|undefined,
        /**
         * The name that the player had before.
         */
        public readonly oldName: string,
        /**
         * The new name that the player has.
         */
        public readonly newName: string
    ) {
        super();

        this._alteredName = newName;
    }

    /**
     * The altered name that the player will have set instead, if changed.
     */
    get alteredName() {
        return this._alteredName;
    }

    /**
     * Revert the player's name back to their old name.
     */
    revert() {
        this.setName(this.oldName);
    }

    /**
     * Change the name that the player had set.
     * @param name The name to set.
     */
    setName(name: string) {
        this._alteredName = name;
    }
}
