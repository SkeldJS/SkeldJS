import { SpawnType } from "@skeldjs/constant";

import { StatefulRoom } from "../StatefulRoom";
import { NormalFlowLogicComponent, NormalMinigameLogicComponent, NormalOptionsLogicComponent, NormalRoleSelectionLogicComponent, NormalUsablesLogicComponent } from "../logic";
import { GameManager } from "./GameManager";
import { PlayerControl } from "./PlayerControl";

/**
 * Represents a class for managing various events for the original impostor/crewmate gamemode.
 */
export class NormalGameManager<RoomType extends StatefulRoom> extends GameManager<RoomType> {
    flow!: NormalFlowLogicComponent<RoomType>;
    minigame!: NormalMinigameLogicComponent<RoomType>;
    roleSelection!: NormalRoleSelectionLogicComponent<RoomType>;
    usables!: NormalUsablesLogicComponent<RoomType>;
    options!: NormalOptionsLogicComponent<RoomType>;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
    ) {
        super(room, spawnType, netId, ownerId, flags);
    }

    async onGameStart(): Promise<void> {
        await this.roleSelection.assignRoles();
    }

    async initComponents(): Promise<void> {
        this.logicComponents = [];

        this.flow = new NormalFlowLogicComponent(this);
        this.minigame = new NormalMinigameLogicComponent(this);
        this.roleSelection = new NormalRoleSelectionLogicComponent(this);
        this.usables = new NormalUsablesLogicComponent(this);
        this.options = new NormalOptionsLogicComponent(this);

        this.logicComponents.push(this.flow, this.minigame, this.roleSelection, this.usables, this.options);
    }
    
    async onPlayerDeath(playerControl: PlayerControl<RoomType>, assignGhostRole: boolean): Promise<void> {
        await this.roleSelection.onPlayerDeath(playerControl, assignGhostRole);
    }

    // TODO: implement (NormalGameManager.cs)
}
