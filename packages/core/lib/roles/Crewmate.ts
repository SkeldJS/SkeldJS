import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { Hostable } from "../Hostable";
import { BaseRole } from "./BaseRole";

export class CrewmateRole<RoomType extends Hostable = Hostable> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Crewmate,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false
    };
}
