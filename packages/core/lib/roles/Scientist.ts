import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { Hostable } from "../Hostable";
import { BaseRole } from "./BaseRole";

export class ScientistRole<RoomType extends Hostable = Hostable>extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Scientist,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false
    };
}
