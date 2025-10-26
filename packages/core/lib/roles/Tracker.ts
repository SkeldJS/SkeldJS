import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class TrackerRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.Tracker,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false,
        tasksCountTowardsProgress: true,
    };
}
