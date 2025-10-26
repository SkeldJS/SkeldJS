import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class CrewmateRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.Crewmate,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false,
        tasksCountTowardsProgress: true,
    };
}
