import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerSetImpostorsEvent extends PlayerEvent {
    static eventName = "player.setimpostors" as const;
    eventName = "player.setimpostors" as const;

    impostors: PlayerData[];

    constructor(room: Hostable<any>, player: PlayerData, impostors: PlayerData[]) {
        super(room, player);

        this.impostors = impostors;
    }
}
