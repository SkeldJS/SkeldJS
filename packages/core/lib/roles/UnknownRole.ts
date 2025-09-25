import { RoleType, RoleTeamType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole } from "./BaseRole";

export class SomeUnknownRole<RoomType extends StatefulRoom = StatefulRoom> extends BaseRole<RoomType> { }

export function UnknownRole(roleType: RoleType) {
    return class <RoomType extends StatefulRoom = StatefulRoom> extends SomeUnknownRole<RoomType> {
        static roleMetadata = {
            roleType: roleType,
            roleTeam: RoleTeamType.Crewmate,
            isGhostRole: false
        };
    };
}
