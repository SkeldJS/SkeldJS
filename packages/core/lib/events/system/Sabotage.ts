import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { AnySystem } from "../../system/events";
import { SystemEvent } from "./SystemEvent";

/**
 * Emitted when a system is sabotaged.
 */
export class SystemSabotageEvent extends SystemEvent {
    static eventName = "system.sabotage" as const;
    eventName = "system.sabotage" as const;

    /**
     * The player that sabotaged the system.
     *
     * Only known if the current client is the host of the room.
     */
    player?: PlayerData;

    constructor(room: Hostable<any>, system: AnySystem, player?: PlayerData) {
        super(room, system);

        this.player = player;
    }
}
