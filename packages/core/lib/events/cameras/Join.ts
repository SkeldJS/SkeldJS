import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SecurityCameraSystem } from "../../system";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { SecurityCameraEvent } from "./SecurityCameraEvent";

export class SecurityCameraJoinEvent extends RevertableEvent implements RoomEvent, SecurityCameraEvent, ProtocolEvent {
    static eventName = "security.cameras.join" as const;
    eventName = "security.cameras.join" as const;

    constructor(
        public readonly room: Hostable,
        public readonly security: SecurityCameraSystem,
        public readonly message: RepairSystemMessage|undefined,
        public readonly player: PlayerData
    ) {
        super();
    }
}
