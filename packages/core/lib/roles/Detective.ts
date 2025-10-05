import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class DetectiveRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Detective,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false
    };
}
