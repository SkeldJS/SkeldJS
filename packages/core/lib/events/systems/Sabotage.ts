import { BasicEvent, RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { AnySystem } from "../../systems/events";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { SystemEvent } from "./SystemEvent";

/**
 * Emitted when a player sabotages a system.
 */
export class SystemSabotageEvent<RoomType extends StatefulRoom = StatefulRoom> extends BasicEvent implements RoomEvent, SystemEvent, ProtocolEvent {
    static eventName = "system.sabotage" as const;
    eventName = "system.sabotage" as const;

    constructor(
        public readonly room: RoomType,
        public readonly system: AnySystem<RoomType>,
        public readonly message: RepairSystemMessage | undefined,
        public readonly player: Player<RoomType> | undefined
    ) {
        super();
    }
}
