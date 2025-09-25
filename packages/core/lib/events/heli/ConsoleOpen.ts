import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { HeliSabotageEvent } from "./HeliSabotageEvent";
import { StatefulRoom } from "../../StatefulRoom";
import { HeliSabotageSystem } from "../../systems";
import { Player } from "../../Player";

/**
 * Emitted when a player opens a heli sabotage console on Airship.
 */
export class HeliSabotageConsoleOpenEvent<RoomType extends StatefulRoom = StatefulRoom> extends RevertableEvent implements RoomEvent, HeliSabotageEvent, ProtocolEvent {
    static eventName = "heli.consoles.open" as const;
    eventName = "heli.consoles.open" as const;

    private _alteredConsoleId: number;
    private _alteredPlayer: Player<RoomType>;

    constructor(
        public readonly room: RoomType,
        public readonly helisabotagesystem: HeliSabotageSystem<RoomType>,
        public readonly message: RepairSystemMessage | undefined,
        /**
         * The player that opened the console.
         */
        public readonly player: Player<RoomType>,
        /**
         * The ID of the console that was opened.
         */
        public readonly consoleId: number
    ) {
        super();

        this._alteredConsoleId = consoleId;
        this._alteredPlayer = player;
    }

    /**
     * The alternate ID of the console that will be opened, if changed.
     */
    get alteredConsoleId() {
        return this._alteredConsoleId;
    }

    /**
     * The alterenate player that will open the console, if changed.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * Change the ID of the console that was opened.
     * @param consoleId the ID of the conosle to open.
     */
    setConsoleId(consoleId: number) {
        this._alteredConsoleId = consoleId;
    }

    /**
     * Change the player that opened the console.
     * @param player The player to open the console.
     */
    setPlayer(player: Player<RoomType>) {
        this._alteredPlayer = player;
    }
}
