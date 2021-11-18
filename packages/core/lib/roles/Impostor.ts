import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { Hostable } from "../Hostable";
import { BaseRole } from "./BaseRole";

export class ImpostorRole<RoomType extends Hostable = Hostable>extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Impostor,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false
    };
}
