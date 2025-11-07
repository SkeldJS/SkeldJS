import { HazelReader } from "@skeldjs/hazel";
import { DeconState } from "@skeldjs/au-constants";
import { BaseSystemMessage, DeconSystemDataMessage, DeconSystemMessage } from "@skeldjs/au-protocol";
import { EventMapFromList } from "@skeldjs/events";

import { System } from "./System";

import { StatefulRoom } from "../StatefulRoom";

import { DataState } from "../NetworkedObject";
import { Player } from "../Player";
import { DeconSystemResetTimerEvent, DeconSystemUpdateStateEvent } from "../events";

export type DeconSystemEvents<RoomType extends StatefulRoom> = EventMapFromList<[
    DeconSystemResetTimerEvent<RoomType>,
    DeconSystemUpdateStateEvent<RoomType>,
]>;

/**
 * Represents a system responsible for the decontamination doors.
 *
 * See {@link DeconSystemEvents} for events to listen to.
 */
export class DeconSystem<RoomType extends StatefulRoom> extends System<RoomType, DeconSystemEvents<RoomType>> {
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
            await this._setTimerWithAuth(data.timer, data);
            await this._setStateWithAuth(data.state, data);
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

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof DeconSystemMessage) {
            await this._setTimerWithAuth(DeconSystem.doorOpenDuration, message);
            await this._setStateWithAuth(message.state, message);
            this.pushDataUpdate();
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        if (this.timer > 0) {
            this.timer = Math.max(this.timer - deltaSeconds, 0);
            if (this.timer === 0) {
                if (this.state & DeconState.Enter) {
                    await this._setStateWithAuth((this.state & (~DeconState.Enter)) | DeconState.Closed, null);
                    await this._setTimerWithAuth(DeconSystem.deconDuration, null);
                } else if (this.state & DeconState.Closed) {
                    await this._setStateWithAuth((this.state & (~DeconState.Closed)) | DeconState.Exit, null);
                    await this._setTimerWithAuth(DeconSystem.doorOpenDuration, null);
                } else if (this.state & DeconState.Exit) {
                    await this._setStateWithAuth(DeconState.Idle, null);
                }
            }
            this.pushDataUpdate();
        }
    }

    protected async _setStateWithAuth(state: number, originMessage: DeconSystemDataMessage|DeconSystemMessage|null) {
        if (state === this.state) return;

        const previousState = this.state;
        this.state = state;
        const ev = await this.emit(
            new DeconSystemUpdateStateEvent(
                this,
                originMessage,
                previousState,
                this.state,
            )
        );
        if (ev.alteredState !== this.state) {
            if (originMessage instanceof DeconSystemDataMessage) {
                await this.setState(ev.alteredState);
            } else {
                this.state = ev.alteredState;
            }
        } else {
            this.pushDataUpdate();
        }
    }

    async setStateWithAuth(state: number): Promise<void> {
        await this._setStateWithAuth(state, null);
    }

    async setStateRequest(state: number): Promise<void> {
        await this.sendUpdateSystem(new DeconSystemMessage(state));
    }

    async setState(state: number): Promise<void> {
        if (this.room.canManageObject(this.shipStatus)) {
            await this.setStateWithAuth(state);
        } else {
            await this.setStateRequest(state);
        }
    }

    protected async _setTimerWithAuth(timer: number, originMessage: DeconSystemDataMessage|DeconSystemMessage|null) {
        const previousTimer = this.timer;
        this.timer = timer;
        if (this.timer > previousTimer) {
            const ev = await this.emit(new DeconSystemResetTimerEvent(this, originMessage, this.timer));
            if (ev.pendingRevert) {
                if (originMessage === null) {
                    this.timer = previousTimer;
                } else {
                    await this.setTimerWithAuth(previousTimer);
                }
            } else {
                this.pushDataUpdate();
            }
        }
    }

    async setTimerWithAuth(timer: number): Promise<void> {
        await this._setTimerWithAuth(timer, null);
    }
}
