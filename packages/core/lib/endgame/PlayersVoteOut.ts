import { Player } from "../Player";

export interface PlayersVoteOutEndgameMetadata {
    exiled: Player;
    aliveCrewmates: number;
    aliveImpostors: number;
}
