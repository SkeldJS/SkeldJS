import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class PhantomRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Phantom,
        roleTeam: RoleTeamType.Impostor,
        isGhostRole: false
    };
}
