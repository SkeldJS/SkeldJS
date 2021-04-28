import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerGameData } from "../../misc/PlayerGameData";
import { GameDataEvent } from "./GameDataEvent";

/**
 * Emitted when a player is removed from the game data player list.
 *
 * This event is not the same as the {@link PlayerLeaveEvent | Player Leave Event} as it doesn't necessarily mean that the player has left the game,
 * just that the object responsible for handling game data has stopped tracking this player's game data. They can still be added back.
 */
export class GameDataRemovePlayerEvent extends GameDataEvent {
    static eventName = "gamedata.removeplayer" as const;
    eventName = "gamedata.removeplayer" as const;

    /**
     * The player data in question that was removed from the game data player list.
     */
    player: PlayerGameData;

    constructor(room: Hostable<any>, gamedata: GameData, player: PlayerGameData) {
        super(room, gamedata);

        this.player = player;
    }
}
