import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { GameOverReason, SystemType } from "@skeldjs/constant";
import { BaseSystemMessage, CompletedConsoleDataMessage, ReactorSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { StatefulRoom } from "../StatefulRoom";
import { AmongUsEndGames, EndGameIntent } from "../endgame";
import { DataState } from "../NetworkedObject";

export type ReactorSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling reactor consoles.
 *
 * See {@link ReactorSystemEvents} for events to listen to.
 */

export class ReactorSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, ReactorSystemEvents<RoomType>> {
    private _lastUpdate = 0;

    /**
     * The timer before the reactor explodes.
     */
    timer: number = 10000;

    /**
     * The completed consoles.
     */
    completed: Set<number> = new Set;
    
    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        public readonly maxTimer: number,
    ) {
        super(ship, systemType);
    }

    get sabotaged() {
        return this.timer < 10000;
    }

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return ReactorSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof ReactorSystemDataMessage) {
            this.timer = data.timer;
            this.completed.clear();
            for (const completedConsole of data.completedConsoles) {
                this.completed.add(completedConsole.consoleId);
            }
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            return new ReactorSystemDataMessage(this.timer, [...this.completed].map(consoleId => new CompletedConsoleDataMessage(consoleId)));
        }
        return undefined;
    }
}
