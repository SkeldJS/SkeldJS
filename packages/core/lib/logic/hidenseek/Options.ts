import { RoleTeamType, TaskBarMode } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";
import { BaseRpcMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { StatefulRoom } from "../../StatefulRoom";
import { HideAndSeekManager } from "../../objects";
import { Player } from "../../Player";
import { NormalOptionsLogicComponent } from "../normal";

export type HideNSeekOptionsLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekOptionsLogicComponent<RoomType extends StatefulRoom> extends NormalOptionsLogicComponent<RoomType> {
    constructor(public readonly manager: HideAndSeekManager<RoomType>) {
        super(manager);
    }
    
    async processFixedUpdate(deltaTime: number): Promise<void> {
        void deltaTime;
    }

    async handleRemoteCall(rpc: BaseRpcMessage): Promise<void> {
        void rpc;
    }

    serializeToWriter(writer: HazelWriter, initialState: boolean): void {
        void writer, initialState;
    }

    deserializeFromReader(reader: HazelReader, initialState: boolean): void {
        void reader, initialState;
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
        return 0.6; // all hide n seek kill distances are set to 0.6
    }

    getKillCooldown() {
        return this.manager.room.settings.killCooldown;
    }

    getPlayerSpeedMod(player: Player<RoomType>) {
        const playerInfo = player.getPlayerInfo();
        if (playerInfo === undefined || playerInfo.roleType === undefined)
            return super.getPlayerSpeedMod(player);

        if (playerInfo.isDead)
            return this.manager.room.settings.playerSpeed + 1;

        if (playerInfo.roleType.roleMetadata.roleTeam === RoleTeamType.Impostor)
            return this.manager.room.settings.playerSpeed;

        const gameSpeed = this.manager.room.settings.playerSpeed * 1.25;
        if (this.manager.flow.isInFinalCountdown)
            return gameSpeed * this.manager.room.settings.finalSeekerSpeed;

        return gameSpeed;
    }

    getAnonymousVotes() {
        return this.manager.room.settings.anonymousVotes;
    }

    getEngineerCooldown() {
        return this.getCrewmateVentCooldown();
    }

    getEngineerInVentTime() {
        return this.getCrewmateInVentTime();
    }

    getCrewmateLeadTime() {
        return 10;
    }

    getEscapeTime() {
        return this.manager.room.settings.hidingTime;
    }

    getFinalCountdownTime() {
        return this.manager.room.settings.finalHideTime;
    }

    getCrewmateVentUses() {
        return this.manager.room.settings.crewmateVentUses;
    }

    getScaryMusicDistance() {
        return 55;
    }

    getVeryScaryMusicDistance() {
        return 15;
    }

    getCrewmateInVentTime() {
        return this.manager.room.settings.crewmateTimeInVent;
    }

    getCrewmateVentCooldown() {
        return 1;
    }

    getCommonTaskTimeValue() {
        return 10 - this.manager.room.playerInfo.size / 2;
    }

    getShortTaskTimeValue() {
        return this.getCommonTaskTimeValue();
    }

    getLongTaskTimeValue() {
        return 20 - this.manager.room.playerInfo.size;
    }

    getSeekerFinalMap() {
        return this.manager.room.settings.finalHideSeekMap;
    }

    getImpostorPlayerId() {
        return this.manager.room.settings.seekerPlayerId;
    }

    hasImpostorPlayerId() {
        return this.manager.room.settings.seekerPlayerId > -1;
    }

    validateImpostorPlayerId() {
        return this.hasImpostorPlayerId() && this.manager.room.getPlayerByPlayerId(this.getImpostorPlayerId()) !== undefined;
    }

    getSeekerPings() {
        return this.manager.room.settings.finalHidePing;
    }

    getMaxPingTime() {
        return this.manager.room.settings.maxPingTime;
    }

    getShowPingTime() {
        return 2;
    }

    getShowCrewmateNames() {
        return this.manager.room.settings.showNames;
    }

    getTaskBarMode() {
        return TaskBarMode.Normal;
    }

    getEmergencyCooldown() {
        return 0;
    }

    getNumEmergencyMeetings() {
        return 0;
    }

    getVisualTasks() {
        return false;
    }

    getGhostsDoTasks() {
        return false;
    }
}
