import { RevertableEvent } from "@skeldjs/events";
import { RoomEvent } from "../RoomEvent";
import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerInfo } from "../../misc/PlayerInfo";
import { GameDataEvent } from "./GameDataEvent";

export class GameDataRemovePlayerEvent extends RevertableEvent implements RoomEvent, GameDataEvent {
    static eventName = "gamedata.removeplayer" as const;
    eventName = "gamedata.removeplayer" as const;

    constructor(
        public readonly room: Hostable,
        public readonly gamedata: GameData,
        public readonly player: PlayerInfo
    ) {
        super();
    }
}
