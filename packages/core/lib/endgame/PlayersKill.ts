import { Player } from "../Player";

export interface PlayersKillEndgameMetadata {
    killer: Player;
    victim?: Player;
    aliveCrewmates: number;
    aliveImpostors: number;
}
