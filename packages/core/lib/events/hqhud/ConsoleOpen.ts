import { RevertableEvent } from "@skeldjs/events";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { HqHudEvent } from "./HqHudEvent";
import { Hostable } from "../../Hostable";
import { HqHudSystem } from "../../system";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { PlayerData } from "../../PlayerData";

export class HqHudConsoleOpenEvent extends RevertableEvent implements RoomEvent, HqHudEvent, ProtocolEvent {
    static eventName = "hqhud.consoles.open" as const;
    eventName = "hqhud.consoles.open" as const;

    private _alteredConsoleId: number;
    private _atleredPlayer: PlayerData;

    constructor(
        public readonly room: Hostable,
        public readonly hqhud: HqHudSystem,
        public readonly message: RepairSystemMessage|undefined,
        public readonly player: PlayerData,
        public readonly consoleId: number
    ) {
        super();

        this._alteredConsoleId = consoleId;
        this._atleredPlayer = player;
    }

    get alteredConsoleId() {
        return this._alteredConsoleId;
    }

    get alteredPlayer() {
        return this._atleredPlayer;
    }

    setConsoleId(consoleId: number) {
        this._alteredConsoleId = consoleId;
    }

    setPlayer(player: PlayerData) {
        this._atleredPlayer = player;
    }
}
