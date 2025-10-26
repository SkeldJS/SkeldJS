import { RoleType, RoleTeamType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { BaseRole, RoleMetadata } from "./BaseRole";

export class SomeUnknownRole<RoomType extends StatefulRoom> extends BaseRole<RoomType> { }

export function UnknownRole(roleType: RoleType) {
    return class <RoomType extends StatefulRoom> extends SomeUnknownRole<RoomType> {
        static roleMetadata: RoleMetadata = {
            roleType: roleType,
            roleTeam: RoleTeamType.Crewmate,
            isGhostRole: false,
            tasksCountTowardsProgress: false,
        };
    };
}
