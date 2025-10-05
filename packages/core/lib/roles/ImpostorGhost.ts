import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class ImpostorGhostRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.ImpostorGhost,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: true
    };

    wasManuallyPicked = false;
}
