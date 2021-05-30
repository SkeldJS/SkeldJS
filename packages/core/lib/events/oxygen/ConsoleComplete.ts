import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { LifeSuppSystem } from "../../system";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { O2Event } from "./O2Event";

export class O2ConsoleCompleteEvent extends RevertableEvent implements RoomEvent, O2Event, ProtocolEvent {
    static eventName = "o2.consoles.complete" as const;
    eventName = "o2.consoles.complete" as const;

    private _alteredConsoleId: number;

    constructor(
        public readonly room: Hostable,
        public readonly oxygen: LifeSuppSystem,
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
