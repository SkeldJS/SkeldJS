import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ReactorSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { ReactorEvent } from "./ReactorEvent";

/**
 * Emitted when a player places their hand on a reactor console.
 */
export class ReactorConsoleAddEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, ReactorEvent, ProtocolEvent {
    static eventName = "reactor.consoles.add" as const;
    eventName = "reactor.consoles.add" as const;

    private _alteredConsoleId: number;

    constructor(
        public readonly room: RoomType,
        public readonly reactor: ReactorSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that placed their hand on the console. Only available
         * if the client is the host.
         */
        public readonly player: PlayerData<RoomType>|undefined,
        /**
         * The ID of the console that the player placed their hand on.
         */
        public readonly consoleId: number
    ) {
        super();

        this._alteredConsoleId = consoleId;
    }

    /**
     * The ID of the altered console that will be added instead, if changed.
     */
    get alteredConsoleId() {
        return this._alteredConsoleId;
    }

    /**
     * Change the console that the player placed their hand on.
     * @param consoleId The ID of the console to set.
     */
    setConsole(consoleId: number) {
        this._alteredConsoleId = consoleId;
    }
}
