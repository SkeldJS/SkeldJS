import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ReactorSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { ReactorEvent } from "./ReactorEvent";

/**
 * Emitted when the reactor consoles are reset, i.e. when reactor is fully
 * repaired.
 */
export class ReactorConsolesResetEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, ReactorEvent, ProtocolEvent {
    static eventName = "reactor.consoles.reset" as const;
    eventName = "reactor.consoles.reset" as const;

    constructor(
        public readonly room: RoomType,
        public readonly reactor: ReactorSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that reset the consoles (repaired reactor). Only available
         * if the client is the host.
         */
        public readonly player: PlayerData<RoomType>|undefined
    ) {
        super();
    }
}
