import { Player } from "../Player";
import { StatefulRoom } from "../StatefulRoom";

export interface PlayersKillEndgameMetadata<RoomType extends StatefulRoom> {
    killer: Player<RoomType>;
    victim?: Player<RoomType>;
    aliveCrewmates: number;
    aliveImpostors: number;
}
