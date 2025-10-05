import { KillDistances } from "@skeldjs/data";
import { ExtractEventTypes } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { GameLogicComponent } from "../GameLogicComponent";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage, GameSettings } from "@skeldjs/protocol";

export type NormalOptionsLogicComponentEvents = ExtractEventTypes<[]>;

export class NormalOptionsLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<NormalOptionsLogicComponentEvents, RoomType> {
    async processFixedUpdate(deltaTime: number): Promise<void> {
        void deltaTime;
    }

    async handleRemoteCall(rpc: BaseRpcMessage): Promise<void> {
        void rpc;
    }

    deserializeFromReader(reader: HazelReader, initialState: boolean): void {
        this.manager.room.settings = reader.read(GameSettings, true);
    }

    serializeToWriter(writer: HazelWriter, initialState: boolean): void {
        writer.write(this.manager.room.settings, true, 10);
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

    getKillDistance() {
        return KillDistances[this.manager.room.settings.killDistance];
    }

    getKillCooldown() {
        return this.manager.room.settings.killCooldown;
    }

    getPlayerSpeedMod(player: Player) {
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
