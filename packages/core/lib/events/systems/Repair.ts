import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { AnySystem } from "../../system/events";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { SystemEvent } from "./SystemEvent";

export class SystemRepairEvent extends RevertableEvent implements RoomEvent, SystemEvent, ProtocolEvent {
    static eventName = "system.repair" as const;
    eventName = "system.repair" as const;

    constructor(
        public readonly room: Hostable,
        public readonly system: AnySystem,
        public readonly message: RepairSystemMessage|undefined,
        public readonly player?: PlayerData
    ) {
        super();
    }
}
