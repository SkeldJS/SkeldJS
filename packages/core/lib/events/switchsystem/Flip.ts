import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SwitchSystem } from "../../system";
import { SwitchSystemEvent } from "./SwitchSystemEvent";

export class SwitchFlipEvent extends SwitchSystemEvent {
    static eventName = "electrical.switch.flip" as const;
    eventName = "electrical.switch.flip" as const;

    num: number;
    value: boolean;
    player?: PlayerData;

    constructor(
        room: Hostable<any>,
        system: SwitchSystem,
        num: number,
        value: boolean,
        player?: PlayerData
    ) {
        super(room, system);

        this.num = num;
        this.value = value;
        this.player = player;
    }
}
