import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SecurityCameraSystem } from "../../system";
import { SecurityCameraSystemEvent } from "./SecurityCameraSystemEvent";

/**
 * Emitted when a player goes off security cameras.
 */
export class SecurityCameraLeaveEvent extends SecurityCameraSystemEvent {
    static eventName = "security.cameras.leave" as const;
    eventName = "security.cameras.leave" as const;

    /**
     * The player that went off cameras.
     */
    player: PlayerData;

    constructor(
        room: Hostable<any>,
        system: SecurityCameraSystem,
        player: PlayerData
    ) {
        super(room, system);

        this.player = player;
    }
}
