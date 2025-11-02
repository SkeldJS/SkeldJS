import { BaseRpcMessage } from "@skeldjs/au-protocol";
import { StatefulRoom } from "../StatefulRoom";
import { HideNSeekDangerLevelLogicComponent, HideNSeekDeathPopupLevelLogicComponent, HideNSeekFlowLogicComponent, HideNSeekMinigameLogicComponent, HideNSeekMusicLogicComponent, HideNSeekOptionsLogicComponent, HideNSeekPingLogicComponent, HideNSeekRoleSelectionLogicComponent, HideNSeekUsablesLogicComponent } from "../logic";
import { GameManager } from "./GameManager";
import { PlayerControl } from "./PlayerControl";

/**
 * Represents a class for managing various events for the Hide'N'Seek gamemode.
 */
export class HideAndSeekManager<RoomType extends StatefulRoom> extends GameManager<RoomType> {
    music!: HideNSeekMusicLogicComponent<RoomType>;
    minigame!: HideNSeekMinigameLogicComponent<RoomType>;
    flow!: HideNSeekFlowLogicComponent<RoomType>;
    usables!: HideNSeekUsablesLogicComponent<RoomType>;
    roleSelection!: HideNSeekRoleSelectionLogicComponent<RoomType>;
    options!: HideNSeekOptionsLogicComponent<RoomType>;
    dangerLevels!: HideNSeekDangerLevelLogicComponent<RoomType>;
    ping!: HideNSeekPingLogicComponent<RoomType>;
    deathPopup!: HideNSeekDeathPopupLevelLogicComponent<RoomType>;

    async initComponents(): Promise<void> {
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

    async onPlayerDeath(playerControl: PlayerControl<RoomType>, assignGhostRole: boolean): Promise<void> {
        await this.roleSelection.onPlayerDeath(playerControl, assignGhostRole);
    }

    // TODO: implement (HideAndSeekManager.cs)
}
