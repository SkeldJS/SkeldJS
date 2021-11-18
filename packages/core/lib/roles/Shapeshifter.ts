import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { Hostable } from "../Hostable";
import { BaseRole } from "./BaseRole";

export class ShapeshifterRole<RoomType extends Hostable = Hostable>extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Shapeshifter,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false
    };
}
