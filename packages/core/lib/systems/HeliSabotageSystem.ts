import { HazelReader } from "@skeldjs/hazel";
import { ActiveConsoleDataMessage, BaseSystemMessage, CompletedConsoleDataMessage, HeliSabotageConsoleUpdate, HeliSabotageSystemDataMessage, HeliSabotageSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SabotagableSystem } from "./SystemStatus";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";
import { ImpostorBySabotageEndGameIntent } from "../EndGameIntent";

export type HeliUserConsolePair<RoomType extends StatefulRoom> = {
    player: Player<RoomType>;
    consoleId: number;
};

export type HeliSabotageSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

function findPairIndex<RoomType extends StatefulRoom>(list: HeliUserConsolePair<RoomType>[], player: Player<RoomType>, consoleId: number): number {
    return list.findIndex(pair => pair.player === player && pair.consoleId === consoleId);
}

/**
 * Represents a system responsible for handling communication consoles on Mira HQ.
 *
 * See {@link HeliSabotageSystemEvents} for events to listen to.
 */
export class HeliSabotageSystem<RoomType extends StatefulRoom> extends SabotagableSystem<RoomType, HeliSabotageSystemEvents<RoomType>> {
    static unsabotagedCountdown = 10000;
    static sabotageDuration = 90;

    static maxResetTimer = 10;
    static consoleIds = [0, 1];
    
    static updateCooldownDuration = 1;
    
    protected updateCooldown: number = 0;

    timer: number = 10000;

    /**
     * The timer until the consoles are reset.
     */
    resetTimer: number = 10000;

    /**
     * The currently opened consoles.
     */
    activeConsoleUserPairs: HeliUserConsolePair<RoomType>[] = [];

    /**
     * The completed consoles.
     */
    completedConsoles: Set<number> = new Set(HeliSabotageSystem.consoleIds);

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return HeliSabotageSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof HeliSabotageSystemDataMessage) {
            this.timer = data.countdown;
            this.resetTimer = data.resetTimer;
            const beforeActive = [...this.activeConsoleUserPairs];
            this.activeConsoleUserPairs = [];
            for (const userConsolePair of data.activeConsoles) {
                const player = this.room.getPlayerByPlayerId(userConsolePair.playerId);
                if (player) {
                    this.activeConsoleUserPairs.push({ player, consoleId: userConsolePair.playerId });
                    if (findPairIndex(beforeActive, player, userConsolePair.consoleId) === -1) {
                        // TODO: event: user opened console
                    }
                }
            }
            for (const { player, consoleId } of beforeActive) {
                if (findPairIndex(this.activeConsoleUserPairs, player, consoleId) !== -1) continue;
                // TODO: event: user closed console
            }

            const beforeCompleted = new Set(this.completedConsoles);
            this.completedConsoles = new Set;
            for (const completedConsole of data.completedConsoles) {
                this.completedConsoles.add(completedConsole.consoleId);
                if (!beforeCompleted.has(completedConsole.consoleId)) {
                    // TODO: event: console completed!
                }
            }

            // console's can't be un-completed in traditional among us. this isn't our job!
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            const message = new HeliSabotageSystemDataMessage(this.timer, this.resetTimer, [], []);
            for (const { player, consoleId } of this.activeConsoleUserPairs) {
                const playerId = player.getPlayerId();
                if (playerId !== undefined) {
                    message.activeConsoles.push(new ActiveConsoleDataMessage(playerId, consoleId));
                }
            }
            for (const completedConsoleId of this.completedConsoles) {
                message.completedConsoles.push(new CompletedConsoleDataMessage(completedConsoleId));
            }
            return message;
        }
        return undefined;
    }

    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return HeliSabotageSystemMessage.deserializeFromReader(reader);
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof HeliSabotageSystemMessage) {
            switch (message.consoleAction) {
            case HeliSabotageConsoleUpdate.StartCountdown:
                await this.sabotageWithAuth();
                break;
            case HeliSabotageConsoleUpdate.CompleteConsole:
                this.resetTimer = HeliSabotageSystem.maxResetTimer;
                this.completedConsoles.add(message.consoleId!);
                // TODO: event: console completed
                break;
            case HeliSabotageConsoleUpdate.AddPlayer:
                if (findPairIndex(this.activeConsoleUserPairs, player, message.consoleId!) !== -1) return;
                this.activeConsoleUserPairs.push({ player, consoleId: message.consoleId! });
                // TODO: event: console completed
                break;
            case HeliSabotageConsoleUpdate.RemovePlayer:
                const idx = findPairIndex(this.activeConsoleUserPairs, player, message.consoleId!);
                if (idx === -1) return;
                this.activeConsoleUserPairs.splice(idx, 1);
                // TODO: event: console no longer completed
                break;
            }
            this.pushDataUpdate();
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        if (this.isSabotaged()) {
            this.timer -= deltaSeconds;
            this.resetTimer -= deltaSeconds;
            if (this.resetTimer < 0) {
                this.resetTimer = HeliSabotageSystem.maxResetTimer;
                this.completedConsoles.clear();
                this.pushDataUpdate();
            }

            this.updateCooldown -= deltaSeconds;
            if (this.updateCooldown < 0) {
                this.updateCooldown = HeliSabotageSystem.updateCooldownDuration;
                this.pushDataUpdate();
            }

            if (this.timer < 0) {
                this.room.registerEndGameIntent(new ImpostorBySabotageEndGameIntent(this));
                await this.fullyRepairWithAuth();
            }
        }
    }

    isSabotaged(): boolean {
        return this.completedConsoles.size < HeliSabotageSystem.consoleIds.length;
    }

    async sabotageWithAuth(): Promise<void> {
        this.timer = HeliSabotageSystem.sabotageDuration;
        this.resetTimer = HeliSabotageSystem.maxResetTimer;
        this.completedConsoles.clear();
        this.pushDataUpdate();
    }

    async fullyRepairWithAuth(): Promise<void> {
        this.timer = HeliSabotageSystem.unsabotagedCountdown;
        this.resetTimer = 10000;
        this.completedConsoles = new Set(HeliSabotageSystem.consoleIds);
        this.pushDataUpdate();
    }

    async fullyRepairRequest(): Promise<void> {
        // TODO: implement
    }

    isConsoleActive(consoleId: number): boolean {
        return this.activeConsoleUserPairs.some(pair => pair.consoleId === consoleId);
    }

    isConsoleComplete(consoleId: number): boolean {
        return this.completedConsoles.has(consoleId);
    }
}
