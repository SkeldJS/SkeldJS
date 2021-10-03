import { BasicEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { DeconSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { DeconEvent } from "./DeconEvent";

/**
 * Emitted when the doors in a decontamination zone close, before the sprayers
 * activate.
 */
export class DeconDoorsCloseEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, DeconEvent, ProtocolEvent {
    static eventName = "decon.doors.close" as const;
    eventName = "decon.doors.close" as const;

    constructor(
        public readonly room: RoomType,
        public readonly deconsystem: DeconSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined
    ) {
        super();
    }
}
