import { GameOverReason } from "@skeldjs/constant";

export enum AmongUsEndGames {
    O2Sabotage = "o2 sabotage",
    ReactorSabotage = "reactor sabotaeg",
    PlayersDisconnect = "players disconnect",
    PlayersVoteOut = "players vote out",
    PlayersKill = "players kill",
    TasksComplete = "tasks complete"
}

/**
 * Represents an intent to end the current game, can be used with {@link Hostable.registerEndGameIntent}.
 */
 export class EndGameIntent<T> {
    constructor(
        public readonly name: string,
        public readonly reason: GameOverReason,
        public readonly metadata: T
    ) {}
}
