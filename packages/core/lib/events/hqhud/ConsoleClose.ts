import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { HqHudEvent } from "./HqHudEvent";
import { Hostable } from "../../Hostable";
import { HqHudSystem } from "../../systems";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player closes a communications console on Mira HQ.
 */
export class HqHudConsoleCloseEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, HqHudEvent, ProtocolEvent {
    static eventName = "hqhud.consoles.close" as const;
    eventName = "hqhud.consoles.close" as const;

    private _alteredConsoleId: number;
    private _alteredPlayer: PlayerData<RoomType>;

    constructor(
        public readonly room: RoomType,
        public readonly hqhudsystem: HqHudSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that closed the console.
         */
        public readonly player: PlayerData<RoomType>,
        /**
         * The ID of the console that was closed.
         */
        public readonly consoleId: number
    ) {
        super();

        this._alteredConsoleId = consoleId;
        this._alteredPlayer = player;
    }

    /**
     * The alternate ID of the console that will be closed, if changed.
     */
    get alteredConsoleId() {
        return this._alteredConsoleId;
    }

    /**
     * The alterenate player that will close the console, if changed.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * Change the ID of the console that was closed.
     * @param consoleId the ID of the conosle to close.
     */
    setConsoleId(consoleId: number) {
        this._alteredConsoleId = consoleId;
    }

    /**
     * Change the player that closed the console.
     * @param player The player to close the console.
     */
    setPlayer(player: PlayerData<RoomType>) {
        this._alteredPlayer = player;
    }
}
