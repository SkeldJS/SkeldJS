import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class ImpostorRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata: RoleMetadata = {
        roleType: RoleType.Impostor,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false,
        tasksCountTowardsProgress: false,
    };
}
