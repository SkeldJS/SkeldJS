import { GameOverReason } from "@skeldjs/constant";

export enum AmongUsEndGames {
    /**
     * An intent to end the game when O2 is sabotaged and  the timer reaches
     * 0, has no metadata.
     */
    O2Sabotage = "o2 sabotage",
    /**
     * An intent to end the game when reactor is sabotaged and the timer reaches
     * 0, has no metadata.
     */
    ReactorSabotage = "reactor sabotage",
    /**
     * An intent to end the game when a player disconnects, either by there not
     * being enough impostors or not being enough crewmates remaining to continue
     * the game. Uses {@link PlayersDisconnectEndgameMetadata} as metadata.
     */
    PlayersDisconnect = "players disconnect",
    /**
     * An intent to end the game when a player is voted out after a meeting, either
     * the last impostor being voted out or there not being enough crewmates
     * remaining to continue the game.
     * Uses {@link PlayersVoteOutEndgameMetadata} as metadata.
     */
    PlayersVoteOut = "players vote out",
    /**
     * An intent to end the game after a player is murdered by a not player, but
     * not registered when a player is voted out, see {@link AmongUsEndGames.PlayersVoteOut}.
     * Uses {@link PlayersKillEndgameMetadata} as metadata.
     */
    PlayersKill = "players kill",
    /**
     * An intent to end the game when all crewmates complete their tasks, uses
     * {@link TasksCompleteEndgameMetadata}.
     */
    TasksComplete = "tasks complete"
}

/**
 * Represents an intent to end the current game, can be used with {@link Hostable.registerEndGameIntent}.
 */
 export class EndGameIntent<T = {}> {
    constructor(
        public readonly name: string,
        public readonly reason: GameOverReason,
        public readonly metadata: T
    ) {}
}
