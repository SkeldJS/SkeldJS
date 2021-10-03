import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { HqHudEvent } from "./HqHudEvent";
import { Hostable } from "../../Hostable";
import { HqHudSystem } from "../../systems";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when a player opens a communications console on Mira HQ.
 */
export class HqHudConsoleOpenEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, HqHudEvent, ProtocolEvent {
    static eventName = "hqhud.consoles.open" as const;
    eventName = "hqhud.consoles.open" as const;

    private _alteredConsoleId: number;
    private _atleredPlayer: PlayerData<RoomType>;

    constructor(
        public readonly room: RoomType,
        public readonly hqhudsystem: HqHudSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that opened the console.
         */
        public readonly player: PlayerData<RoomType>,
        /**
         * The ID of the console that was opened.
         */
        public readonly consoleId: number
    ) {
        super();

        this._alteredConsoleId = consoleId;
        this._atleredPlayer = player;
    }

    /**
     * The alternate console ID that will be opened, if changed.
     */
    get alteredConsoleId() {
        return this._alteredConsoleId;
    }

    /**
     * The alternate player that will open the console, if changed.
     */
    get alteredPlayer() {
        return this._atleredPlayer;
    }

    /**
     * Change the ID of the console that was opened.
     * @param consoleId The ID of the console to open.
     */
    setConsoleId(consoleId: number) {
        this._alteredConsoleId = consoleId;
    }

    /**
     * Change the player that opened the console.
     * @param player The player to open the console.
     */
    setPlayer(player: PlayerData<RoomType>) {
        this._atleredPlayer = player;
    }
}
