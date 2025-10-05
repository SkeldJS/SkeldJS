import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class ImpostorRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Impostor,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false
    };
}
