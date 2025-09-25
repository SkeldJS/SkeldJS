import { RoleTeamType } from "@skeldjs/constant";
import { StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";

export interface RoleMetadata {
    roleType: number;
    roleTeam: RoleTeamType;
    isGhostRole: boolean;
}

export class BaseRole<RoomType extends StatefulRoom = StatefulRoom> {
    static roleMetadata: RoleMetadata;

    constructor(public readonly player: Player<RoomType>) { }

    onInitialize(): any {
        return;
    }
}
