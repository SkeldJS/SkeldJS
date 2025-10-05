import { RoleTeamType, RoleType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class TrackerRole<RoomType extends StatefulRoom = StatefulRoom> extends BaseRole<RoomType> {
    static roleMetadata = {
        roleType: RoleType.Tracker,
        roleTeam: RoleTeamType.Crewmate,
        isGhostRole: false
    };
}
