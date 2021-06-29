import { BasicEvent } from "@skeldjs/events";
import { SetStartCounterMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player (i.e. the host of the room) sets the starting counter
 * located above the game code while in the lobby.
 */
export class PlayerSetStartCounterEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setstartcounter" as const;
    eventName = "player.setstartcounter" as const;

    private _alteredCounter: number;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SetStartCounterMessage|undefined,
        /**
         * The old value of the counter.
         */
        public readonly oldCounter: number,
        /**
         * The new value of the counter.
         */
        public readonly newCounter: number
    ) {
        super();

        this._alteredCounter = newCounter;
    }

    /**
     * The altered value of the counter that will be set instead, if changed,
     */
    get alteredCounter() {
        return this._alteredCounter;
    }

    /**
     * Revert the counter to its old value.
     */
    revert() {
        this.setCounter(this.oldCounter);
    }

    /**
     * Change the value of the counter that was set.
     * @param counter The value of the counter to set.
     */
    setCounter(counter: number) {
        this._alteredCounter = counter;
    }
}
