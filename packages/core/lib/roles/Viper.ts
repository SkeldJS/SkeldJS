import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class ViperRole<RoomType extends StatefulRoom = StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Viper,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false
    };
}
