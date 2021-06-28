import { BasicEvent } from "@skeldjs/events";

/**
 * Emitted when a game is found while searching for a local game with {@link LanDiscovery}.
 */
export class DiscoveryFoundGameEvent extends BasicEvent {
    static eventName = "discovery.foundgame" as const;
    eventName = "discovery.foundgame" as const;

    /**
     * The game code that you should use to join this game, hardcoded at 0x20 (32).
     */
    gameCode: number;

    constructor(
        /**
         * The local IP address that this game came from.
         */
        public readonly ip: string,
        /**
         * The port that this game came from.
         */
        public readonly port: number,
        /**
         * The name of the room, usually the name of the player hosting the game.
         */
        public readonly name: string,
        /**
         * The number of players in the game out of the maximum 15.
         */
        public readonly playerCount: number
    ) {
        super();

        this.gameCode = 0x20;
    }
}