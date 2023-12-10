import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { Hostable } from "../Hostable";
import { BaseRole } from "./BaseRole";

export class ImpostorGhost<RoomType extends Hostable = Hostable> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.ImpostorGhost,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false
    };

    wasManuallyPicked = false;
}
