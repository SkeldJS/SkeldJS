import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { HqHudSystem } from "../../system";
import { HqHudSystemEvent } from "./HqHudSystemEvent";

export class HqHudConsoleCloseEvent extends HqHudSystemEvent {
    static eventName = "hqhud.consoles.close" as const;
    eventName = "hqhud.consoles.close" as const;

    consoleid: number;
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
