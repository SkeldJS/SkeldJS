import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerSetStartCounterEvent extends PlayerEvent {
    static eventName = "player.setcounter" as const;
    eventName = "player.setcounter" as const;

    counter: number;

    constructor(room: Hostable<any>, player: PlayerData, counter: number) {
        super(room, player);

        this.counter = counter;
    }
}
