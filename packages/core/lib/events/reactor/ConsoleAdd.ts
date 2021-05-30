import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ReactorSystem } from "../../system";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { ReactorEvent } from "./ReactorEvent";

export class ReactorConsoleAddEvent extends RevertableEvent implements RoomEvent, ReactorEvent, ProtocolEvent {
    static eventName = "reactor.consoles.add" as const;
    eventName = "reactor.consoles.add" as const;

    private _alteredConsoleId: number;

    constructor(
        public readonly room: Hostable,
        public readonly reactor: ReactorSystem,
        public readonly message: RepairSystemMessage|undefined,
        public readonly player: PlayerData|undefined,
        public readonly consoleId: number
    ) {
        super();

        this._alteredConsoleId = consoleId;
    }

    get alteredConsoleId() {
        return this._alteredConsoleId;
    }

    setConsole(consoleId: number) {
        this._alteredConsoleId = consoleId;
    }
}
