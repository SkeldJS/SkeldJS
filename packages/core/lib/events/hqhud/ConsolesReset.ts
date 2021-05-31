import { RevertableEvent } from "@skeldjs/events";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { HqHudEvent } from "./HqHudEvent";
import { Hostable } from "../../Hostable";
import { HqHudSystem } from "../../system";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { PlayerData } from "../../PlayerData";

/**
 * Emitted when the communication consoles on Mira HQ are reset, i.e. the 10s
 * timer reaching 0.
 */
export class HqHudConsolesResetEvent extends RevertableEvent implements RoomEvent, HqHudEvent, ProtocolEvent {
    static eventName = "hqhud.consoles.reset" as const;
    eventName = "hqhud.consoles.reset" as const;

    constructor(
        public readonly room: Hostable,
        public readonly hqhud: HqHudSystem,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that reset the consoles. Only available if the client is the host.
         */
        public readonly player: PlayerData|undefined
    ) {
        super();
    }
}
