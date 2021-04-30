import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { HqHudSystem } from "../../system";
import { HqHudSystemEvent } from "./HqHudSystemEvent";

/**
 * Emitted when someone complets a communication console on Mira HQ.
 */
export class HqHudConsoleCompleteEvent extends HqHudSystemEvent {
    static eventName = "hqhud.consoles.complete" as const;
    eventName = "hqhud.consoles.complete" as const;

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
        system: HqHudSystem,
        consoleid: number,
        player?: PlayerData
    ) {
        super(room, system);

        this.consoleid = consoleid;
        this.player = player;
    }
}
