import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { HqHudEvent } from "./HqHudEvent";
import { Hostable } from "../../Hostable";
import { HqHudSystem } from "../../systems";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player completes a console while communications is sabotaged on Mira HQ.
 */
export class HqHudConsoleCompleteEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, HqHudEvent, ProtocolEvent {
    static eventName = "hqhud.consoles.complete" as const;
    eventName = "hqhud.consoles.complete" as const;

    private _alteredConsoleId: number;

    constructor(
        public readonly room: RoomType,
        public readonly hqhudsystem: HqHudSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that completed the console. Only availabe if the client
         * is the host.
         */
        public readonly player: PlayerData<RoomType>|undefined,
        /**
         * The ID of the console that was completed.
         */
        public readonly consoleId: number
    ) {
        super();

        this._alteredConsoleId = consoleId;
    }

    /**
     * The ID of the alternate console that will be completed, if changed.
     */
    get alteredConsoleId() {
        return this._alteredConsoleId;
    }

    /**
     * Change the ID of the console that was completed.
     * @param consoleId The ID of the console to complete.
     */
    setConsoleId(consoleId: number) {
        this._alteredConsoleId = consoleId;
    }
}
