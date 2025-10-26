import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class CrewmateGhostRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.CrewmateGhost,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: true,
        tasksCountTowardsProgress: true,
    };
}
