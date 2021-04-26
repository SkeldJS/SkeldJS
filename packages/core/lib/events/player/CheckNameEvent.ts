import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class CheckNameEvent extends PlayerEvent {
    static eventName = "player.checkname" as const;
    eventName = "player.checkname" as const;

    name: string;

    constructor(
        room: Hostable,
        player: PlayerData,
        name: string
    ) {
        super(room, player);

        this.name = name;
    }

    setName(name: string) {
        this.name = name;
    }
}
