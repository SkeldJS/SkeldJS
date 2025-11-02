import { RoleTeamType, RoleType } from "@skeldjs/au-constants";
import { StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";

export interface RoleMetadata {
    roleType: RoleType;
    roleTeam: RoleTeamType;
    isGhostRole: boolean;
    tasksCountTowardsProgress: boolean;
}

export class BaseRole<RoomType extends StatefulRoom> {
    static roleMetadata: RoleMetadata;

    constructor(public readonly player: Player<RoomType>) { }

    onInitialize(): any {
        return;
    }
}
