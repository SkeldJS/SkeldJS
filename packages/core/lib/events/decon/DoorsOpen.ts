import { BasicEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { DeconSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { DeconEvent } from "./DeconEvent";

/**
 * Emitted when the doors in a decontamination zone open.
 */
export class DeconDoorsOpenEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, DeconEvent, ProtocolEvent {
    static eventName = "decon.doors.open" as const;
    eventName = "decon.doors.open" as const;

    constructor(
        public readonly room: RoomType,
        public readonly deconsystem: DeconSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined
    ) {
        super();
    }
}
