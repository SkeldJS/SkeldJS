import { BaseSystemMessage, MushroomMixupOperation, MushroomMixupSystemDataMessage, MushroomMixupSystemMessage, PlayerMixupDataMessage } from "@skeldjs/protocol";
import { HazelReader } from "@skeldjs/hazel";
import { SabotagableSystem } from "./SystemStatus";
import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";
import { Color, Hat, MushroomMixupState, PlayerOutfitType, Skin } from "@skeldjs/constant";
import { mushroomMixupHatIds, mushroomMixupPetIds, mushroomMixupVisorIds } from "@skeldjs/data";
import { NetworkedPlayerInfo, PlayerOutfit } from "../objects";

export type MixUpData = {
    colorOfPlayerId: number;
    hatIdx: number;
    visorIdx: number;
    skinIdx: number;
    petIdx: number;
};

export class MushroomMixupSabotageSystem<RoomType extends StatefulRoom> extends SabotagableSystem<RoomType> {
    static autoHealDuration = 10;
    static updateCooldownDuration = 2;

    availableSkinIds: string[] = [ Skin.None ];

    state: MushroomMixupState = MushroomMixupState.Inactive;
    secondsUntilHeal: number = 0;

    playersMixedUp: Map<number, MixUpData> = new Map;

    updateCooldown: number = 0;

    createOutfit(playerInfo: NetworkedPlayerInfo<RoomType>, data: MixUpData): PlayerOutfit {
        return new PlayerOutfit(
            PlayerOutfitType.MushroomMixup,
            playerInfo.defaultOutfit.name,
            this.room.playerInfo.get(data.colorOfPlayerId)?.defaultOutfit.color || Color.Red,
            mushroomMixupHatIds[data.hatIdx],
            mushroomMixupPetIds[data.petIdx],
            this.availableSkinIds[data.skinIdx],
            mushroomMixupVisorIds[data.visorIdx],
            playerInfo.defaultOutfit.nameplateId,
        );
    }

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Update:
        case DataState.Spawn: return MushroomMixupSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof MushroomMixupSystemDataMessage) {
            const oldState = this.state;

            this.state = data.state;
            this.secondsUntilHeal = data.secondsUntilHeal;

            this.playersMixedUp.clear();
            for (const mixup of data.mixups) {
                this.playersMixedUp.set(mixup.playerId, {
                    colorOfPlayerId: mixup.colorOfPlayerId,
                    hatIdx: mixup.hatIdx,
                    visorIdx: mixup.visorIdx,
                    skinIdx: mixup.skinIdx,
                    petIdx: mixup.petIdx,
                });
            }

            if (this.state !== oldState && this.state === MushroomMixupState.JustTriggered) {
                this.applyMixupOutfits();
                this.state = MushroomMixupState.IdleButMixedUp;
            }
            if (this.state !== oldState && this.state === MushroomMixupState.Inactive) {
                this.removeMixupOutfits();
            }
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Update:
        case DataState.Spawn:
            const message = new MushroomMixupSystemDataMessage(this.state, this.secondsUntilHeal, []);
            for (const [ playerId, mixupData ] of this.playersMixedUp) {
                message.mixups.push(new PlayerMixupDataMessage(
                    playerId,
                    mixupData.colorOfPlayerId,
                    mixupData.hatIdx,
                    mixupData.visorIdx,
                    mixupData.skinIdx,
                    mixupData.petIdx,
                ));
            }
            if (dataState === DataState.Update && this.state === MushroomMixupState.JustTriggered) {
                this.state = MushroomMixupState.IdleButMixedUp;
            }
            return message;
        }
        return undefined;
    }

    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return MushroomMixupSystemMessage.deserializeFromReader(reader);
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof MushroomMixupSystemMessage) {
            switch (message.operation) {
            case MushroomMixupOperation.Nothing: return;
            case MushroomMixupOperation.Sabotage:
                await this.sabotageWithAuth();
                break;
            }
            this.pushDataUpdate();
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        if (this.isSabotaged()) {
            this.secondsUntilHeal -= deltaSeconds;
            this.updateCooldown -= deltaSeconds;
            if (this.updateCooldown <= 0) {
                this.updateCooldown = MushroomMixupSabotageSystem.updateCooldownDuration;
                this.pushDataUpdate();
            }

            if (this.secondsUntilHeal <= 0) {
                await this.fullyRepairWithAuth();
            }
        }
    }
    
    isCritical(): boolean {
        return false;
    }

    isSabotaged(): boolean {
        return this.secondsUntilHeal > 0;
    }

    applyMixupOutfits() {
        for (const [ , playerInfo ] of this.room.playerInfo) {
            const mixup = this.playersMixedUp.get(playerInfo.playerId);
            if (!mixup) continue;

            playerInfo.setOutfit(this.createOutfit(playerInfo, mixup));
        }
    }

    async sabotageWithAuth(): Promise<void> {
        this.state = MushroomMixupState.JustTriggered;
        this.secondsUntilHeal = MushroomMixupSabotageSystem.autoHealDuration;
        const playerIdsPool = [...this.room.playerInfo.keys()];

        for (const [ , playerInfo ] of this.room.playerInfo) {
            if (playerInfo.isDisconnected || playerInfo.isDead) continue;

            const colorOfPlayerIdIdx = Math.floor(Math.random() * playerIdsPool.length);
            const colorOfPlayerId = playerIdsPool[colorOfPlayerIdIdx];
            playerIdsPool.splice(colorOfPlayerIdIdx, 1);

            this.playersMixedUp.set(playerInfo.playerId, {
                colorOfPlayerId: colorOfPlayerId,
                hatIdx: Math.floor(Math.random() * mushroomMixupHatIds.length),
                visorIdx: Math.floor(Math.random() * mushroomMixupVisorIds.length),
                petIdx: Math.floor(Math.random() * mushroomMixupPetIds.length),
                skinIdx: Math.floor(Math.random() * this.availableSkinIds.length),
            });
        }

        this.applyMixupOutfits();

        this.pushDataUpdate();
    }

    removeMixupOutfits() {
        for (const [ , playerInfo ] of this.room.playerInfo) {
            const mixup = this.playersMixedUp.get(playerInfo.playerId);
            if (!mixup) continue;

            playerInfo.deleteOutfit(PlayerOutfitType.MushroomMixup);
        }
    }

    async fullyRepairWithAuth(): Promise<void> {
        this.state = MushroomMixupState.Inactive;
        this.secondsUntilHeal = 0;
        this.removeMixupOutfits();
        this.playersMixedUp.clear();
        this.pushDataUpdate();
    }

    async fullyRepairRequest(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}