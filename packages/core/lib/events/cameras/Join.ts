import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { SecurityCameraSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { SecurityCameraEvent } from "./SecurityCameraEvent";

/**
 * Emitted when a player starts watching security cameras.
 */
export class SecurityCameraJoinEvent<RoomType extends StatefulRoom = StatefulRoom> extends RevertableEvent implements RoomEvent, SecurityCameraEvent, ProtocolEvent {
    static eventName = "security.cameras.join" as const;
    eventName = "security.cameras.join" as const;

    constructor(
        public readonly room: RoomType,
        public readonly security: SecurityCameraSystem<RoomType>,
        public readonly message: RepairSystemMessage | undefined,
        /**
         * The player that went onto the security cameras.
         */
        public readonly player: Player<RoomType>
    ) {
        super();
    }
}
