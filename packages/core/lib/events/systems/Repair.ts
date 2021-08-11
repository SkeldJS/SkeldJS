import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { AnySystem } from "../../systems/events";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { SystemEvent } from "./SystemEvent";

/**
 * Emitted when a player fully repairs a system.
 */
export class SystemRepairEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, SystemEvent, ProtocolEvent {
    static eventName = "system.repair" as const;
    eventName = "system.repair" as const;

    constructor(
        public readonly room: RoomType,
        public readonly system: AnySystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        public readonly player?: PlayerData<RoomType>
    ) {
        super();
    }
}
