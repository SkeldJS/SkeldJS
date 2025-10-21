import { HazelReader } from "@skeldjs/hazel";
import { DeconState } from "@skeldjs/constant";
import { BaseSystemMessage, DeconSystemDataMessage, DeconSystemMessage, RepairSystemMessage } from "@skeldjs/protocol";
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
    static deconDuration = 3;
    static doorOpenDuration = 3;

    /**
     * How long before decontamination doors open.
     */
    timer: number = 0;

    /**
     * The state of the decontamination system, to be calculated with {@link DeconState}
     */
    state: number = DeconState.Idle;

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return DeconSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof DeconSystemDataMessage) {
            const previousState = this.state;
            this.timer = data.timer;
            this.state = data.state;
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return new DeconSystemDataMessage(this.timer, this.state);
        }
        return undefined;
    }
    
    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return DeconSystemMessage.deserializeFromReader(reader);
    }

    async handleUpdate(message: BaseSystemMessage): Promise<void> {
        if (message instanceof DeconSystemMessage) {
            this.state = message.state;
            this.timer = DeconSystem.doorOpenDuration;
            this.pushDataUpdate();
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        if (this.timer > 0) {
            this.timer = Math.max(this.timer - deltaSeconds, 0);
            if (this.timer === 0) {
                if (this.state & DeconState.Enter) {
                    this.state &= ~DeconState.Enter;
                    this.state |= DeconState.Closed;
                    this.timer = DeconSystem.deconDuration;
                } else if (this.state & DeconState.Closed) {
                    this.state &= ~DeconState.Closed;
                    this.state |= DeconState.Exit;
                    this.timer = DeconSystem.doorOpenDuration;
                } else if (this.state & DeconState.Exit) {
                    this.state = DeconState.Idle;
                }
            }
            this.pushDataUpdate();
        }
    }
}
