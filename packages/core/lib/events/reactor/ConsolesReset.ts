import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ReactorSystem } from "../../system";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { ReactorEvent } from "./ReactorEvent";

export class ReactorConsolesResetEvent extends RevertableEvent implements RoomEvent, ReactorEvent, ProtocolEvent {
    static eventName = "reactor.consoles.reset" as const;
    eventName = "reactor.consoles.reset" as const;

    constructor(
        public readonly room: Hostable,
        public readonly reactor: ReactorSystem,
        public readonly message: RepairSystemMessage|undefined,
        public readonly player: PlayerData|undefined
    ) {
        super();
    }
}
