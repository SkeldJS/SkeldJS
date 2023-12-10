import { HazelBuffer } from "@skeldjs/util";
import { Hostable } from "../Hostable";
import { HideNSeekDangerLevelLogicComponent, HideNSeekDeathPopupLevelLogicComponent, HideNSeekFlowLogicComponent, HideNSeekMinigameLogicComponent, HideNSeekMusicLogicComponent, HideNSeekOptionsLogicComponent, HideNSeekPingLogicComponent, HideNSeekRoleSelectionLogicComponent, HideNSeekUsablesLogicComponent } from "../logic";
import { InnerGameManager, InnerGameManagerData } from "./InnerGameManager";
import { SpawnType } from "@skeldjs/constant";

/**
 * Represents a class for managing various events for the Hide'N'Seek gamemode.
 */
export class HideAndSeekManager<RoomType extends Hostable = Hostable> extends InnerGameManager<RoomType> {
    music!: HideNSeekMusicLogicComponent<RoomType>;
    minigame!: HideNSeekMinigameLogicComponent<RoomType>;
    flow!: HideNSeekFlowLogicComponent<RoomType>;
    usables!: HideNSeekUsablesLogicComponent<RoomType>;
    roleSelection!: HideNSeekRoleSelectionLogicComponent<RoomType>;
    options!: HideNSeekOptionsLogicComponent<RoomType>;
    dangerLevels!: HideNSeekDangerLevelLogicComponent<RoomType>;
    ping!: HideNSeekPingLogicComponent<RoomType>;
    deathPopup!: HideNSeekDeathPopupLevelLogicComponent<RoomType>; 

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
        data?: HazelBuffer | InnerGameManagerData
    ) {
        super(room, spawnType, netId, ownerId, flags, data);
    }

    initComponents(): void {
        this.logicComponents = [];
        
        this.music = new HideNSeekMusicLogicComponent(this);
        this.minigame = new HideNSeekMinigameLogicComponent(this);
        this.flow = new HideNSeekFlowLogicComponent(this);
        this.usables = new HideNSeekUsablesLogicComponent(this);
        this.roleSelection = new HideNSeekRoleSelectionLogicComponent(this);
        this.options = new HideNSeekOptionsLogicComponent(this);
        this.dangerLevels = new HideNSeekDangerLevelLogicComponent(this);
        this.ping = new HideNSeekPingLogicComponent(this);
        this.deathPopup = new HideNSeekDeathPopupLevelLogicComponent(this);

        this.logicComponents.push(this.music, this.minigame, this.flow, this.usables, this.roleSelection, this.options, this.dangerLevels, this.ping, this.deathPopup);
    }

    async onGameStart(): Promise<void> {
        await this.roleSelection.assignRoles();
    }

    // TODO: implement (HideAndSeekManager.cs)
}
