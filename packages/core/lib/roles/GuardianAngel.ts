import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { Hostable } from "../Hostable";
import { BaseRole } from "./BaseRole";

export class GuardianAngelRole<RoomType extends Hostable = Hostable> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.GuardianAngel,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: true
    };
}
