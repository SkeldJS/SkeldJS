import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class ImpostorGhost<RoomType extends StatefulRoom = StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.ImpostorGhost,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false
    };

    wasManuallyPicked = false;
}
