import { HazelReader } from "@skeldjs/hazel";
import { GameOverReason, SystemType } from "@skeldjs/au-constants";
import { ActiveConsoleDataMessage, BaseSystemMessage, ReactorConsoleUpdate, ReactorSystemDataMessage, ReactorSystemMessage } from "@skeldjs/au-protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { ShipStatus } from "../objects";
import { SabotagableSystem } from "./System";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";
import { ImpostorBySabotageEndGameIntent } from "../EndGameIntent";

export type ReactorSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

export type ReactorUserConsolePair<RoomType extends StatefulRoom> = {
    player: Player<RoomType>;
    consoleId: number;
};

/**
 * Represents a system responsible for handling reactor consoles.
 *
 * See {@link ReactorSystemEvents} for events to listen to.
 */

function findPairIndex<RoomType extends StatefulRoom>(list: ReactorUserConsolePair<RoomType>[], player: Player<RoomType>, consoleId: number): number {
    return list.findIndex(pair => pair.player === player && pair.consoleId === consoleId);
}

export class ReactorSystem<RoomType extends StatefulRoom> extends SabotagableSystem<RoomType, ReactorSystemEvents<RoomType>> {
    static unsabotagedTimer = 10000;
    static numConsoles = 2;

    static updateCooldownDuration = 2;

    protected updateCooldown: number = 0;

    /**
     * The timer before the reactor explodes.
     */
    timer: number = ReactorSystem.unsabotagedTimer;

    sabotageDuration: number = 45;

    /**
     * The completed consoles.
     */
    userConsolePairs: ReactorUserConsolePair<RoomType>[] = [];
    
    constructor(
        public readonly shipStatus: ShipStatus<RoomType>,
        public readonly systemType: SystemType,
    ) {
        super(shipStatus, systemType);
    }

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return ReactorSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async _handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof ReactorSystemDataMessage) {
            this.timer = data.timer;
            const before = [...this.userConsolePairs];
            this.userConsolePairs = [];
            for (const userConsolePair of data.userConsolePairs) {
                const player = this.room.getPlayerByPlayerId(userConsolePair.playerId);
                if (player) {
                    this.userConsolePairs.push({ player, consoleId: userConsolePair.playerId });
                    if (findPairIndex(before, player, userConsolePair.consoleId) === -1) {
                        // TODO: event: console completed!
                    }
                }
            }
            for (const { player, consoleId } of before) {
                if (findPairIndex(this.userConsolePairs, player, consoleId) !== -1) continue;

                // TODO: event: console no longer completed
            }
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            const message = new ReactorSystemDataMessage(this.timer, []);
            for (const { player, consoleId } of this.userConsolePairs) {
                const playerId = player.getPlayerId();
                if (playerId !== undefined) {
                    message.userConsolePairs.push(new ActiveConsoleDataMessage(playerId, consoleId));
                }
            }
            return message;
        }
        return undefined;
    }
    
    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return ReactorSystemMessage.deserializeFromReader(reader);
    }

    async _handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof ReactorSystemMessage) {
            switch (message.consoleAction) {
            case ReactorConsoleUpdate.StartCountdown:
                await this._sabotageWithAuth();
                break;
            case ReactorConsoleUpdate.EndCountdown:
                await this._fullyRepairWithAuth();
                break;
            case ReactorConsoleUpdate.AddPlayer:
                if (findPairIndex(this.userConsolePairs, player, message.consoleId!) !== -1) return;
                this.userConsolePairs.push({ player, consoleId: message.consoleId! });
                if (this.isConsoleComplete(0) && this.isConsoleComplete(1)) {
                    await this._fullyRepairWithAuth();
                }
                // TODO: event: console completed
                break;
            case ReactorConsoleUpdate.RemovePlayer:
                const idx = findPairIndex(this.userConsolePairs, player, message.consoleId!);
                if (idx === -1) return;
                this.userConsolePairs.splice(idx, 1);
                // TODO: event: console no longer completed
                break;
            }
            this.pushDataUpdate();
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        if (this.isSabotaged()) {
            this.timer -= deltaSeconds;
            this.updateCooldown -= deltaSeconds;
            if (this.updateCooldown <= 0) {
                this.updateCooldown = ReactorSystem.updateCooldownDuration;
                this.pushDataUpdate();
            }
            if (this.timer < 0) {
                this.room.registerEndGameIntent(new ImpostorBySabotageEndGameIntent(this));
                await this._fullyRepairWithAuth();
            }
        }
    }

    isCritical(): boolean {
        return true;
    }
    
    isSabotaged(): boolean {
        return this.timer < 10000;
    }

    async _sabotageWithAuth(): Promise<void> {
        this.timer = this.sabotageDuration;
        this.userConsolePairs = [];
        this.pushDataUpdate();
    }

    async _fullyRepairWithAuth(): Promise<void> {
        this.timer = ReactorSystem.unsabotagedTimer;
        this.pushDataUpdate();
    }

    async fullyRepairRequest(): Promise<void> {
        // TODO: implement
    }

    isConsoleComplete(consoleId: number): boolean {
        return this.userConsolePairs.some(pair => pair.consoleId === consoleId);
    }
}
