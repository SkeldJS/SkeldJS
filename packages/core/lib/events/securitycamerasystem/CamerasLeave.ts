import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SecurityCameraSystem } from "../../system";
import { SecurityCameraSystemEvent } from "./SecuritySystemEvent";

export class SecurityCameraLeaveEvent extends SecurityCameraSystemEvent {
    static eventName = "security.cameras.leave" as const;
    eventName = "security.cameras.leave" as const;

    player: PlayerData;

    constructor(
        room: Hostable,
        system: SecurityCameraSystem,
        player: PlayerData
    ) {
        super(room, system);

        this.player = player;
    }
}
