import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerExitVentEvent extends PlayerEvent {
    static eventName = "player.exitvent" as const;
    eventName = "player.exitvent" as const;

    ventid: number;

    constructor(room: Hostable<any>, player: PlayerData, ventid: number) {
        super(room, player);

        this.ventid = ventid;
    }
}
