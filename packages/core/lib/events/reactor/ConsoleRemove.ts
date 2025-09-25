import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ReactorSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { ReactorEvent } from "./ReactorEvent";

/**
 * Emitted when a player places their hand on a reactor console.
 */
export class ReactorConsoleRemoveEvent<RoomType extends StatefulRoom = StatefulRoom> extends RevertableEvent implements RoomEvent, ReactorEvent, ProtocolEvent {
    static eventName = "reactor.consoles.remove" as const;
    eventName = "reactor.consoles.remove" as const;

    private _alteredConsoleId: number;

    constructor(
        public readonly room: RoomType,
        public readonly reactor: ReactorSystem<RoomType>,
        public readonly message: RepairSystemMessage | undefined,
        /**
         * The player that removed their hand from the console. Only available
         * if the client is the host.
         */
        public readonly player: Player<RoomType> | undefined,
        public readonly consoleId: number
    ) {
        super();

        this._alteredConsoleId = consoleId;
    }

    /**
     * The ID of the altered console that will be removed instead, if changed.
     */
    get alteredConsoleId() {
        return this._alteredConsoleId;
    }

    /**
     * Change the console that the player removed their hand from.
     * @param consoleId The ID of the console to set.
     */
    setConsole(consoleId: number) {
        this._alteredConsoleId = consoleId;
    }
}
