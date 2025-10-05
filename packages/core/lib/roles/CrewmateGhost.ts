import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class CrewmateGhostRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.CrewmateGhost,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: true
    };
}
