import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { HqHudSystem } from "../../system";
import { HqHudSystemEvent } from "./HqHudSystemEvent";

export class HqHudConsoleOpenEvent extends HqHudSystemEvent {
    static eventName = "hqhud.consoles.open" as const;
    eventName = "hqhud.consoles.open" as const;

    consoleid: number;
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
