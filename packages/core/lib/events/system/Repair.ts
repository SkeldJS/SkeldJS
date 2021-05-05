import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { AnySystem } from "../../system/events";
import { SystemEvent } from "./SystemEvent";

/**
 * Emitted when a system is repaired.
 */
export class SystemRepairEvent extends SystemEvent {
    static eventName = "system.repair" as const;
    eventName = "system.repair" as const;

    /**
     * The player that repaired the system
     *
     * Only known if the current client is the host of the room.
     */
    player?: PlayerData;

    constructor(room: Hostable<any>, system: AnySystem, player?: PlayerData) {
        super(room, system);

        this.player = player;
    }
}
