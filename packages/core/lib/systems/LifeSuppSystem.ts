import { HazelReader } from "@skeldjs/hazel";
import { BaseSystemMessage, CompletedConsoleDataMessage, LifeSuppSystemDataMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export type LifeSuppSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling oxygen consoles.
 *
 * See {@link LifeSuppSystemEvents} for events to listen to.
 */
export class LifeSuppSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, LifeSuppSystemEvents<RoomType>> {
    private lastUpdate = 0;

    /**
     * The timer until oxygen runs out.
     */
    timer: number = 10000;

    /**
     * The completed consoles.
     */
    completedConsoles: Set<number> = new Set;

    get sabotaged() {
        return this.timer < 10000;
    }
    
    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return LifeSuppSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof LifeSuppSystemDataMessage) {
            const previousTimer = this.timer;
            this.timer = data.timer;

            this.completedConsoles = new Set;
            for (const completedConsole of data.completedConsoles) {
                if (this.completedConsoles.has(completedConsole.consoleId)) continue;
                this.completedConsoles.add(completedConsole.consoleId);
            }
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return new LifeSuppSystemDataMessage(this.timer,
            [...this.completedConsoles].map(consoleId => new CompletedConsoleDataMessage(consoleId)));
        }
        return undefined;
    }
}
