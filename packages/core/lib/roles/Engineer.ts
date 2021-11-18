import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { Hostable } from "../Hostable";
import { BaseRole } from "./BaseRole";

export class EngineerRole<RoomType extends Hostable = Hostable>extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Engineer,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false
    };
}
