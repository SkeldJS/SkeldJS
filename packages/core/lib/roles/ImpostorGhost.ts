import { RoleTeamType, RoleType } from "@skeldjs/au-constants";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class ImpostorGhostRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.ImpostorGhost,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: true,
        tasksCountTowardsProgress: false,
    };

    wasManuallyPicked = false;
}
