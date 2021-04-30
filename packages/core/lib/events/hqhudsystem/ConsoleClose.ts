import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { HqHudSystem } from "../../system";
import { HqHudSystemEvent } from "./HqHudSystemEvent";

/**
 * Emitted when someone closes a communications console on Mira HQ.
 */
export class HqHudConsoleCloseEvent extends HqHudSystemEvent {
    static eventName = "hqhud.consoles.close" as const;
    eventName = "hqhud.consoles.close" as const;

    /**
     * The ID of the console that was closed.
     */
    consoleid: number;

    /**
     * The player that closed the communications console.
     */
    player: PlayerData;

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
