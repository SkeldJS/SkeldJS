import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class GuardianAngelRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.GuardianAngel,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: true,
        tasksCountTowardsProgress: true,
    };
}
