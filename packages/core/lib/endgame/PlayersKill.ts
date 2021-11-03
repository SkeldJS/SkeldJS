import { PlayerData } from "../PlayerData";

export interface PlayersKillEndgameMetadata {
    killer: PlayerData;
    victim?: PlayerData;
    aliveCrewmates: number;
    aliveImpostors: number;
}
