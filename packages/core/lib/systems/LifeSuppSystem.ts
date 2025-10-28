import { HazelReader } from "@skeldjs/hazel";
import { BaseSystemMessage, CompletedConsoleDataMessage, LifeSuppConsoleUpdate, LifeSuppSystemDataMessage, LifeSuppSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";
import { GameOverReason } from "@skeldjs/constant";

import { SabotagableSystem } from "./SystemStatus";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";
import { ImpostorBySabotageEndGameIntent } from "../EndGameIntent";

export type LifeSuppSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling communication consoles on Mira HQ.
 *
 * See {@link LifeSuppSystemEvents} for events to listen to.
 */
export class LifeSuppSystem<RoomType extends StatefulRoom> extends SabotagableSystem<RoomType, LifeSuppSystemEvents<RoomType>> {
    static unsabotagedCountdown = 10000;
    static sabotageDuration = 90;

    static maxResetTimer = 10;
    static consoleIds = [0, 1];
    
    static updateCooldownDuration = 1;
    
    protected updateCooldown: number = 0;

    timer: number = 10000;

    /**
     * The completed consoles.
     */
    completedConsoles: Set<number> = new Set(LifeSuppSystem.consoleIds);

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return LifeSuppSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof LifeSuppSystemDataMessage) {
            this.timer = data.countdown;

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
            const message = new LifeSuppSystemDataMessage(this.timer, []);
            for (const completedConsoleId of this.completedConsoles) {
                message.completedConsoles.push(new CompletedConsoleDataMessage(completedConsoleId));
            }
            return message;
        }
        return undefined;
    }

    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return LifeSuppSystemMessage.deserializeFromReader(reader);
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof LifeSuppSystemMessage) {
            switch (message.consoleAction) {
            case LifeSuppConsoleUpdate.StartCountdown:
                await this.sabotageWithAuth();
                break;
            case LifeSuppConsoleUpdate.EndCountdown:
                await this.fullyRepairWithAuth();
                break;
            case LifeSuppConsoleUpdate.CompleteConsole:
                this.completedConsoles.add(message.consoleId!);
                // TODO: event: console completed
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
                this.updateCooldown = LifeSuppSystem.updateCooldownDuration;
                this.pushDataUpdate();
            }
            
            if (this.timer < 0) {
                this.room.registerEndGameIntent(new ImpostorBySabotageEndGameIntent(this));
                await this.fullyRepairWithAuth();
            }
        }
    }

    isCritical(): boolean {
        return true;
    }

    isSabotaged(): boolean {
        return this.completedConsoles.size < LifeSuppSystem.consoleIds.length;
    }

    async sabotageWithAuth(): Promise<void> {
        this.timer = LifeSuppSystem.sabotageDuration;
        this.completedConsoles.clear();
        this.pushDataUpdate();
    }

    async fullyRepairWithAuth(): Promise<void> {
        this.timer = LifeSuppSystem.unsabotagedCountdown;
        this.completedConsoles = new Set(LifeSuppSystem.consoleIds);
        this.pushDataUpdate();
    }

    async fullyRepairRequest(): Promise<void> {
        // TODO: implement
    }

    isConsoleComplete(consoleId: number): boolean {
        return this.completedConsoles.has(consoleId);
    }
}
