import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { SystemType } from "@skeldjs/constant";
import { ActiveConsoleDataMessage, BaseSystemMessage, CompletedConsoleDataMessage, HeliSabotageSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export type HeliSabotageSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

export const HeliSabotageSystemRepairTag = {
    FixBit: 0x10,
    DeactiveBit: 0x20,
    ActiveBit: 0x40,
    DamageBit: 0x80
} as const;

/**
 * Represents a system responsible for handling communication sabotages on The Skeld and Polus.
 *
 * See {@link HeliSabotageSystemEvents} for events to listen to.
 */
export class HeliSabotageSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, HeliSabotageSystemEvents<RoomType>> {
    private _syncTimer: number = 1;

    countdown: number = 10000;
    resetTimer: number = -1;
    activeConsoles: Map<number, number> = new Map;
    completedConsoles: Set<number> = new Set;

    /**
     * Whether or not communications is sabotaged.
     */
    get sabotaged() {
        return this.completedConsoles.size < 2;
    }

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return HeliSabotageSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof HeliSabotageSystemDataMessage) {
            this.countdown = data.countdown;
            this.resetTimer = data.resetTimer;

            const beforeActive = this.activeConsoles;
            this.activeConsoles = new Map;
            for (const activeConsole of data.activeConsoles) {
                this.activeConsoles.set(activeConsole.playerId, activeConsole.consoleId);
                beforeActive.delete(activeConsole.playerId);
                const player = this.room.getPlayerByPlayerId(activeConsole.playerId);
                const playerId = player?.getPlayerId();
                if (playerId !== undefined) {
                    this.activeConsoles.set(playerId, activeConsole.playerId);
                }
            }

            for (const [playerId, consoleId] of beforeActive) {
                const player = this.shipStatus.room.getPlayerByPlayerId(playerId);
                if (player) {
                    this.activeConsoles.delete(playerId);
                }
            }

            const numCompletedBefore = this.completedConsoles.size;
            for (const completedConsole of data.completedConsoles) {
                this.completedConsoles.add(completedConsole.consoleId);
            }
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            const message = new HeliSabotageSystemDataMessage(this.countdown, this.resetTimer, [], []);
            for (const [ playerId, consoleId ] of this.activeConsoles) {
                message.activeConsoles.push(new ActiveConsoleDataMessage(playerId, consoleId));
            }
            for (const consoleId of this.completedConsoles) {
                message.completedConsoles.push(new CompletedConsoleDataMessage(consoleId));
            }
            return message;
        }
        return undefined;
    }
}
