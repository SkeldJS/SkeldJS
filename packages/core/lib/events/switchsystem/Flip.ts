import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SwitchSystem } from "../../system";
import { SwitchSystemEvent } from "./SwitchSystemEvent";

export class SwitchFlipEvent extends SwitchSystemEvent {
    num: number;
    value: boolean;
    player?: PlayerData;

    constructor(
        room: Hostable,
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
