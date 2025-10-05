import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { HeliSabotageEvent } from "./HeliSabotageEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { HeliSabotageSystem } from "../../systems";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";

/**
 * Emitted when a player completes a console while the heli is sabotaged on Airship.
 */
export class HeliSabotageConsoleCompleteEvent<RoomType extends StatefulRoom> extends RevertableEvent implements HeliSabotageEvent<RoomType>, ProtocolEvent {
    static eventName = "heli.consoles.complete" as const;
    eventName = "heli.consoles.complete" as const;

    private _alteredConsoleId: number;

    constructor(
        public readonly room: RoomType,
        public readonly helisabotagesystem: HeliSabotageSystem<RoomType>,
        public readonly message: RepairSystemMessage | undefined,
        /**
         * The player that completed the console. Only availabe if the client
         * is the host.
         */
        public readonly player: Player<RoomType> | undefined,
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
