import { RoleType, RoleTeamType } from "@skeldjs/constant";
import { Hostable } from "../Hostable";
import { BaseRole } from "./BaseRole";

export class SomeUnknownRole<RoomType extends Hostable = Hostable> extends BaseRole<RoomType> {}

export function UnknownRole(roleType: RoleType) {
    return class<RoomType extends Hostable = Hostable> extends SomeUnknownRole<RoomType> {
        static roleMetadata = {
            roleType: roleType,
            roleTeam: RoleTeamType.Crewmate,
            isGhostRole: false
        };
    };
}
