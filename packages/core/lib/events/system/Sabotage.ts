import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SystemStatus } from "../../system";
import { SystemEvent } from "./SystemEvent";

export class SystemSabotageEvent extends SystemEvent {
    static eventName = "system.sabotage" as const;
    eventName = "system.sabotage" as const;

    player?: PlayerData;

    constructor(
        room: Hostable<any>,
        system: SystemStatus<any, any>,
        player?: PlayerData
    ) {
        super(room, system);

        this.player = player;
    }
}
