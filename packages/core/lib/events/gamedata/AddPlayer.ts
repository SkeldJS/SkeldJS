import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerGameData } from "../../misc/PlayerGameData";
import { GameDataEvent } from "./GameDataEvent";

/**
 * Emitted when a player is added to the game data player list.
 *
 * This event is not the same as the {@link PlayerJoinEvent | Player Join Event} as this only applies when the player has actually spawned.
 *
 * This event does not necessarily mean that the player has name/colour information, although that may be the case. To listen for those, see the
 * {@link PlayerSetColorEvent | Player Set Color Event} and the {@link PlayerSetNameEvent | Player Set Name Event}.
 *
 * @example
 * ```ts
 * // Log whenever a player gets added to gamedata.
 * // Note how 'name' is not necessarily anything meaningful when it is first created.
 * client.on("gamedata.addplayer", ev => {
 *   console.log("A player with name " + ev.player.name + " was added.");
 * });
 * ```
 */
export class GameDataAddPlayerEvent extends GameDataEvent {
    static eventName = "gamedata.addplayer" as const;
    eventName = "gamedata.addplayer" as const;

    /**
     * The player data in question that was added to the game data player list.
     */
    player: PlayerGameData;

    constructor(room: Hostable<any>, gamedata: GameData, player: PlayerGameData) {
        super(room, gamedata);

        this.player = player;
    }
}
