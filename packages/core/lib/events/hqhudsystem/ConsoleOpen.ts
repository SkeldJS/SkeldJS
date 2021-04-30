import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { HqHudSystem } from "../../system";
import { HqHudSystemEvent } from "./HqHudSystemEvent";

/**
 * Emitted when someone opens a communications console on Mira HQ.
 */
export class HqHudConsoleOpenEvent extends HqHudSystemEvent {
    static eventName = "hqhud.consoles.open" as const;
    eventName = "hqhud.consoles.open" as const;

    /**
     * The ID of the console that was opened.
     */
    consoleid: number;

    /**
     * The player that opened the console.
     */
    player: PlayerData;

    constructor(
        room: Hostable<any>,
        system: HqHudSystem,
        consoleid: number,
        player: PlayerData
    ) {
        super(room, system);

        this.consoleid = consoleid;
        this.player = player;
    }
}
