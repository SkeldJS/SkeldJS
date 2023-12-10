import { RoleTeamType, TaskBarMode } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { HideAndSeekManager } from "../../objects";
import { PlayerData } from "../../PlayerData";
import { NormalOptionsLogicComponent } from "../normal";

export type HideNSeekOptionsLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekOptionsLogicComponent<RoomType extends Hostable = Hostable> extends NormalOptionsLogicComponent<RoomType> {
    constructor(public readonly manager: HideAndSeekManager<RoomType>) {
        super(manager);
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

    getPlayerSpeedMod(player: PlayerData) {
        if (player.playerInfo === undefined || player.playerInfo.roleType === undefined)
            return super.getPlayerSpeedMod(player);

        if (player.playerInfo.isDead)
            return this.manager.room.settings.playerSpeed + 1;

        if (player.playerInfo.roleType.roleMetadata.roleTeam === RoleTeamType.Impostor)
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
        if (!this.manager.room.gameData)
            throw new Error("No gamedata!");

        return 10 - this.manager.room.gameData.players.size /2;
    }

    getShortTaskTimeValue() {
        return this.getCommonTaskTimeValue();
    }

    getLongTaskTimeValue() {
        if (!this.manager.room.gameData)
            throw new Error("No gamedata!");

        return 20 - this.manager.room.gameData.players.size;
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
