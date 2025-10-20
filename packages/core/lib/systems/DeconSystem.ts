import { HazelReader } from "@skeldjs/hazel";
import { DeconState } from "@skeldjs/constant";
import { BaseDataMessage, DeconSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";

import { StatefulRoom } from "../StatefulRoom";

import { DataState } from "../NetworkedObject";

export type DeconSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a system responsible for the decontamination doors.
 *
 * See {@link DeconSystemEvents} for events to listen to.
 */
export class DeconSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, DeconSystemEvents<RoomType>> {
    /**
     * How long before decontamination doors open.
     */
    timer: number = 0;

    /**
     * The state of the decontamination system, to be calculated with {@link DeconState}
     */
    state: number = DeconState.Idle;

    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return DeconSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof DeconSystemDataMessage) {
            const previousState = this.state;
            this.timer = data.timer;
            this.state = data.state;
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return new DeconSystemDataMessage(this.timer, this.state);
        }
        return undefined;
    }
}
