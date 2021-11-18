import { RoleTeamType } from "@skeldjs/constant";
import { Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";

export interface RoleMetadata {
    roleType: number;
    roleTeam: RoleTeamType;
    isGhostRole: boolean;
}

export class BaseRole<RoomType extends Hostable = Hostable> {
    static roleMetadata: RoleMetadata;

    constructor(public readonly player: PlayerData<RoomType>) {}

    onInitialize(): any {
        return;
    }
}
