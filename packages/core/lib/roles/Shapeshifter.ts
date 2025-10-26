import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class ShapeshifterRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.Shapeshifter,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false,
        tasksCountTowardsProgress: false,
    };
}
