import { HazelReader } from "@skeldjs/hazel";
import { ActiveConsoleDataMessage, BaseDataMessage, CompletedConsoleDataMessage, HqHudSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export type UserConsolePair = {
    playerId: number;
    consoleId: number;
};

export type HqHudSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

export const HqHudSystemRepairTag = {
    CompleteConsole: 0x10,
    CloseConsole: 0x20,
    OpenConsole: 0x40
} as const;

/**
 * Represents a system responsible for handling communication consoles on Mira HQ.
 *
 * See {@link HqHudSystemEvents} for events to listen to.
 */
export class HqHudSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, HqHudSystemEvents<RoomType>> {
    /**
     * The timer until the consoles are reset.
     */
    timer: number = 10000;

    /**
     * The currently opened consoles.
     */
    activeConsoles: UserConsolePair[] = [];

    /**
     * The completed consoles.
     */
    completedConsoles: Set<number> = new Set([0, 1]);

    get sabotaged() {
        return this.completedConsoles.size < 2;
    }

    private _getIdx(consoleId: number, playerId: number) {
        return this.activeConsoles.findIndex(
            (pair) => pair.consoleId === consoleId && pair.playerId === playerId
        );
    }

    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return HqHudSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof HqHudSystemDataMessage) {
            const beforeActive = this.activeConsoles;
            this.activeConsoles = [];
            for (const activeConsole of data.activeConsoles) {
                this.activeConsoles.push({ playerId: activeConsole.playerId, consoleId: activeConsole.consoleId });
            }

            for (const consolePair of beforeActive) {
                const activeIdx = this.activeConsoles.findIndex(activeConsole =>
                    activeConsole.playerId === consolePair.playerId && activeConsole.consoleId === consolePair.consoleId);

                if (activeIdx) continue;

                const player = this.ship.room.getPlayerByPlayerId(consolePair.playerId);
                if (player) {
                    this.activeConsoles.splice(activeIdx, 1);
                }
            }

            const numCompletedBefore = this.completedConsoles.size;
            for (const completedConsole of data.completedConsoles) {
                this.completedConsoles.add(completedConsole.consoleId);
            }
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            return new HqHudSystemDataMessage(
                this.activeConsoles.map(x => new ActiveConsoleDataMessage(x.playerId, x.consoleId)),
                [...this.completedConsoles].map(consoleId => new CompletedConsoleDataMessage(consoleId))
            );
        }
        return undefined;
    }
}
