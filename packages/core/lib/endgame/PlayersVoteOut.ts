import { Player } from "../Player";
import { StatefulRoom } from "../StatefulRoom";

export interface PlayersVoteOutEndgameMetadata<RoomType extends StatefulRoom> {
    exiled: Player<RoomType>;
    aliveCrewmates: number;
    aliveImpostors: number;
}
