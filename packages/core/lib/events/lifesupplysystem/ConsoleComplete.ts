import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { LifeSuppSystem } from "../../system";
import { O2SystemEvent } from "./O2SystemEvent";

export class O2ConsoleCompleteEvent extends O2SystemEvent {
    static eventName = "o2.consoles.complete" as const;
    eventName = "o2.consoles.complete" as const;

    consoleid: number;
    player?: PlayerData;

    constructor(
        room: Hostable,
        system: LifeSuppSystem,
        consoleid: number,
        player: PlayerData
    ) {
        super(room, system);

        this.consoleid = consoleid;
        this.player = player;
    }
}
