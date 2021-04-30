import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SwitchSystem } from "../../system";
import { SwitchSystemEvent } from "./SwitchSystemEvent";

/**
 * Emitted when someone flips a switch in electrical.
 */
export class SwitchFlipEvent extends SwitchSystemEvent {
    static eventName = "electrical.switch.flip" as const;
    eventName = "electrical.switch.flip" as const;

    /**
     * The ID of the switch that was flipped.
     */
    num: number;

    /**
     * The value of the switch. (Up/Down)
     */
    value: boolean;

    /**
     * The player that flipped the switch.
     *
     * Only known if the current client is the host of the room.
     */
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
