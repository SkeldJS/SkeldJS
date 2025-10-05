import { BasicEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { StatefulRoom } from "../../StatefulRoom";
import { DeconSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { DeconEvent } from "./DeconEvent";

/**
 * Emitted when the doors in a decontamination zone close, before the sprayers
 * activate.
 */
export class DeconDoorsCloseEvent<RoomType extends StatefulRoom> extends BasicEvent implements DeconEvent<RoomType>, ProtocolEvent {
    static eventName = "decon.doors.close" as const;
    eventName = "decon.doors.close" as const;

    constructor(
        public readonly room: RoomType,
        public readonly deconsystem: DeconSystem<RoomType>,
        public readonly message: RepairSystemMessage | undefined
    ) {
        super();
    }
}
