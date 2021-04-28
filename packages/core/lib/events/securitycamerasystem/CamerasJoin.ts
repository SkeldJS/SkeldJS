import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SecurityCameraSystem } from "../../system";
import { SecurityCameraSystemEvent } from "./SecurityCameraSystemEvent";

export class SecurityCameraJoinEvent extends SecurityCameraSystemEvent {
    static eventName = "security.cameras.join" as const;
    eventName = "security.cameras.join" as const;

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
