import { RevertableEvent } from "@skeldjs/events";
import { RoomEvent } from "../RoomEvent";
import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerInfo } from "../../misc/PlayerInfo";
import { GameDataEvent } from "./GameDataEvent";

export class GameDataAddPlayerEvent extends RevertableEvent implements RoomEvent, GameDataEvent {
    static eventName = "gamedata.addplayer" as const;
    eventName = "gamedata.addplayer" as const;

    constructor(
        public readonly room: Hostable,
        public readonly gamedata: GameData,
        public readonly player: PlayerInfo
    ) {
        super();
    }
}
