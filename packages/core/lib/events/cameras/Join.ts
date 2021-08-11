import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SecurityCameraSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { SecurityCameraEvent } from "./SecurityCameraEvent";

/**
 * Emitted when a player starts watching security cameras.
 */
export class SecurityCameraJoinEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, SecurityCameraEvent, ProtocolEvent {
    static eventName = "security.cameras.join" as const;
    eventName = "security.cameras.join" as const;

    constructor(
        public readonly room: RoomType,
        public readonly security: SecurityCameraSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that went onto the security cameras.
         */
        public readonly player: PlayerData<RoomType>
    ) {
        super();
    }
}
