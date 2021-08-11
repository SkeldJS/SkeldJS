import { RevertableEvent } from "@skeldjs/events";
import { RoomEvent } from "../RoomEvent";
import { GameData } from "../../objects";
import { Hostable } from "../../Hostable";
import { PlayerInfo } from "../../misc/PlayerInfo";
import { GameDataEvent } from "./GameDataEvent";

/**
 * Emitted when a player is removed from gamedata.
 */
export class GameDataRemovePlayerEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, GameDataEvent {
    static eventName = "gamedata.removeplayer" as const;
    eventName = "gamedata.removeplayer" as const;

    constructor(
        public readonly room: RoomType,
        public readonly gamedata: GameData<RoomType>,
        /**
         * The player information that was removed.
         */
        public readonly player: PlayerInfo<RoomType>
    ) {
        super();
    }
}
