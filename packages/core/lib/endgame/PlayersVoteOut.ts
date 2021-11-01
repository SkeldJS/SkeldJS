import { PlayerData } from "../PlayerData";

export interface PlayersVoteOutEndgameMetadata {
    exiled: PlayerData;
    aliveCrewmates: number;
    aliveImpostors: number;
}
