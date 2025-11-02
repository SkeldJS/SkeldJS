import { ExtractEventTypes } from "@skeldjs/events";
import { HazelReader } from "@skeldjs/hazel";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { GameLogicComponent } from "../GameLogicComponent";
import { BaseSystemMessage, OptionsLogicComponentDataMessage } from "@skeldjs/protocol";
import { KillDistance } from "@skeldjs/constant";

export type NormalOptionsLogicComponentEvents = ExtractEventTypes<[]>;

export class NormalOptionsLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<NormalOptionsLogicComponentEvents, RoomType> {
    parseData(reader: HazelReader): BaseSystemMessage | undefined {
        return OptionsLogicComponentDataMessage.deserializeFromReader(reader);
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof OptionsLogicComponentDataMessage) {
            this.manager.room.settings = data.settings;
        }
    }

    createData(): BaseSystemMessage | undefined {
        return new OptionsLogicComponentDataMessage(this.manager.room.settings);
    }
    
    async processFixedUpdate(deltaTime: number): Promise<void> {
        void deltaTime;
    }

    async onGameStart(): Promise<void> {
        void 0;
    }

    async onGameEnd(): Promise<void> {
        void 0;
    }

    async onDestroy(): Promise<void> {
        void 0;
    }

    async onPlayerDisconnect(): Promise<void> {
        void 0;
    }

    getMapId() {
        return this.manager.room.settings.map;
    }

    getMaxPlayers() {
        return this.manager.room.settings.maxPlayers;
    }

    getNumImpostors() {
        return this.manager.room.settings.numImpostors;
    }

    getAdjustedNumImpostors(numPlayers: number) {
        return numPlayers < 7 ? 1 : numPlayers < 9 ? 2 : 3;
    }

    getKillDistance(): number {
        switch (this.manager.room.settings.killDistance) {
        case KillDistance.Short: return 1.0;
        case KillDistance.Medium: return 1.8;
        case KillDistance.Long: return 2.5;
        }
    }

    getKillCooldown() {
        return this.manager.room.settings.killCooldown;
    }

    getPlayerSpeedMod(player: Player<RoomType>) {
        return this.manager.room.settings.playerSpeed;
    }

    getConfirmImpostor() {
        return this.manager.room.settings.confirmEjects;
    }

    getAnonymousVotes() {
        return this.manager.room.settings.anonymousVotes;
    }

    getGuardianAngelCooldown() {
        return this.manager.room.settings.roleSettings.guardianAngelCooldown;
    }

    getShapeshifterDuration() {
        return this.manager.room.settings.roleSettings.shapeshiftDuration;
    }

    getShapeshifterCooldown() {
        return this.manager.room.settings.roleSettings.shapeshifterCooldown;
    }

    getShapeshifterLeaveSkin() {
        return this.manager.room.settings.roleSettings.shapeshifterLeaveSkin;
    }

    getScientistCooldown() {
        return this.manager.room.settings.roleSettings.scientistCooldown;
    }

    getScientistBatteryCharge() {
        return this.manager.room.settings.roleSettings.scientistBatteryCharge;
    }

    getEngineerCooldown() {
        return this.manager.room.settings.roleSettings.engineerCooldown;
    }

    getEngineerInVentTime() {
        return this.manager.room.settings.roleSettings.engineerInVentMaxTime;
    }

    getShowCrewmateNames() {
        return true;
    }

    getTaskBarMode() {
        return this.manager.room.settings.taskbarUpdates;
    }

    getEmergencyCooldown() {
        return this.manager.room.settings.emergencyCooldown;
    }

    getNumEmergencyMeetings() {
        return this.manager.room.settings.numEmergencies;
    }

    getVisualTasks() {
        return this.manager.room.settings.visualTasks;
    }

    getGhostsDoTasks() {
        return true;
    }
}
