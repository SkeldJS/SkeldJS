import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerClimbLadderEvent extends PlayerEvent {
    static eventName = "player.climbladder" as const;
    eventName = "player.climbladder" as const;

    ladderid: number;

    constructor(room: Hostable, player: PlayerData, ladderid: number) {
        super(room, player);

        this.ladderid = ladderid;
    }
}
