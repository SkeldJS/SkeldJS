import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class ShapeshifterRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Shapeshifter,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false
    };
}
