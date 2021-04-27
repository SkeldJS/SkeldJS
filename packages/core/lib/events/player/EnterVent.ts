import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerEnterVentEvent extends PlayerEvent {
    static eventName = "player.entervent" as const;
    eventName = "player.entervent" as const;

    ventid: number;

    constructor(room: Hostable, player: PlayerData, ventid: number) {
        super(room, player);

        this.ventid = ventid;
    }
}
