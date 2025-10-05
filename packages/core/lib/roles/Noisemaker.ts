import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class NoisemakerRole<RoomType extends StatefulRoom = StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Noisemaker,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false
    };
}
