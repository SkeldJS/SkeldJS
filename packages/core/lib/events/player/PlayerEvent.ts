import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";

export class PlayerEvent extends RoomEvent {
    player: PlayerData;

    constructor(room: Hostable<any>, player: PlayerData) {
        super(room);

        this.player = player;
    }
}
