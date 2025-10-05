import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class EngineerRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Engineer,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false
    };
}
