import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { LifeSuppSystem } from "../../system";
import { O2SystemEvent } from "./O2SystemEvent";

/**
 * Emitted when someone completed an o2 console.
 */
export class O2ConsoleCompleteEvent extends O2SystemEvent {
    static eventName = "o2.consoles.complete" as const;
    eventName = "o2.consoles.complete" as const;

    /**
     * The ID of the console that was completed.
     */
    consoleid: number;

    /**
     * The player that completed the console.
     *
     * Only known if the current client is the host of the room.
     */
    player?: PlayerData;

    constructor(
        room: Hostable<any>,
        system: LifeSuppSystem,
        consoleid: number,
        player?: PlayerData
    ) {
        super(room, system);

        this.consoleid = consoleid;
        this.player = player;
    }
}
