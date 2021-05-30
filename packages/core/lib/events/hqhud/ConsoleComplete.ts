import { RevertableEvent } from "@skeldjs/events";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { HqHudEvent } from "./HqHudEvent";
import { Hostable } from "../../Hostable";
import { HqHudSystem } from "../../system";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { PlayerData } from "../../PlayerData";

export class HqHudConsoleCompleteEvent extends RevertableEvent implements RoomEvent, HqHudEvent, ProtocolEvent {
    static eventName = "hqhud.consoles.complete" as const;
    eventName = "hqhud.consoles.complete" as const;

    private _alteredConsoleId: number;

    constructor(
        public readonly room: Hostable,
        public readonly hqhud: HqHudSystem,
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

    setConsoleId(consoleId: number) {
        this._alteredConsoleId = consoleId;
    }
}
