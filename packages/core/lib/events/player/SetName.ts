import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerSetNameEvent extends PlayerEvent {
    static eventName = "player.setname" as const;
    eventName = "player.setname" as const;

    name: string;

    constructor(room: Hostable<any>, player: PlayerData, name: string) {
        super(room, player);

        this.name = name;
    }
}
