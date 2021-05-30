import { BasicEvent } from "@skeldjs/events";
import { SetStartCounterMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerSetStartCounterEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setstartcounter" as const;
    eventName = "player.setstartcounter" as const;

    private _alteredCounter: number;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: SetStartCounterMessage|undefined,
        public readonly oldCounter: number,
        public readonly newCounter: number
    ) {
        super();

        this._alteredCounter = newCounter;
    }

    get alteredCounter() {
        return this._alteredCounter;
    }

    revert() {
        this.setCounter(this.oldCounter);
    }

    setCounter(counter: number) {
        this._alteredCounter = counter;
    }
}
