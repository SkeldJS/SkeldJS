import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SecurityCameraSystem } from "../../system";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { SecurityCameraEvent } from "./SecurityCameraEvent";

/**
 * Emitted when a player starts watching security cameras.
 */
export class SecurityCameraJoinEvent extends RevertableEvent implements RoomEvent, SecurityCameraEvent, ProtocolEvent {
    static eventName = "security.cameras.join" as const;
    eventName = "security.cameras.join" as const;

    constructor(
        public readonly room: Hostable,
        public readonly security: SecurityCameraSystem,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that went onto the security cameras.
         */
        public readonly player: PlayerData
    ) {
        super();
    }
}
