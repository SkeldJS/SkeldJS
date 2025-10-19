import { HazelReader } from "@skeldjs/hazel";
import { DeconState } from "@skeldjs/constant";
import { BaseDataMessage, DeconSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { SystemStatusEvents } from "./events";
import { StatefulRoom } from "../StatefulRoom";

import {
    DeconDoorsCloseEvent,
    DeconDoorsOpenEvent,
    DeconEnterEvent,
    DeconExitEvent
} from "../events";

import { DataState } from "../NetworkedObject";

export type DeconSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> & ExtractEventTypes<[
    DeconDoorsCloseEvent<RoomType>,
    DeconDoorsOpenEvent<RoomType>,
    DeconEnterEvent<RoomType>,
    DeconExitEvent<RoomType>,
]>;
/**
 * Represents a system responsible for the decontamination doors.
 *
 * See {@link DeconSystemEvents} for events to listen to.
 */
export class DeconSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType> {
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
            if ((previousState & DeconState.Closed) && !(this.state & DeconState.Closed)) {
                if (this.state & DeconState.Enter) {
                    await this.emit(new DeconEnterEvent(this.room, this, undefined, undefined, (this.state & DeconState.HeadingUp) > 0));
                } else if (this.state & DeconState.Exit) {
                    await this.emit(new DeconExitEvent(this.room, this, undefined, undefined, (this.state & DeconState.HeadingUp) > 0));
                }
            }

            if (!(previousState & DeconState.Closed) && (this.state & DeconState.Closed)) {
                await this.emit(new DeconDoorsCloseEvent(this.room, this, undefined));
            } else if ((previousState & DeconState.Closed) && !(this.state & DeconState.Closed)) {
                await this.emit(new DeconDoorsOpenEvent(this.room, this, undefined));
            }
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return new DeconSystemDataMessage(this.timer, this.state);
        }
        return undefined;
    }

    private async _enterDecon(headingUp: boolean, player: Player<RoomType> | undefined, message: RepairSystemMessage | undefined) {
        if ((this.state & DeconState.Enter) && !!(this.state & DeconState.HeadingUp) === headingUp) {
            return;
        }

        const previousHeadingUp = !!DeconState.HeadingUp;
        this.state = DeconState.Enter & ~DeconState.Closed;
        if (headingUp) {
            this.state |= DeconState.HeadingUp;
        }
        this.pushDataUpdate();

        const ev = await this.emit(
            new DeconEnterEvent(
                this.room,
                this,
                message,
                player,
                headingUp
            )
        );

        this.emitSync(
            new DeconDoorsOpenEvent(
                this.room,
                this,
                undefined
            )
        );

        if (ev.reverted) {
            this.state &= ~DeconState.Enter;
            if (previousHeadingUp) {
                this.state |= DeconState.HeadingUp;
            } else {
                this.state &= ~DeconState.HeadingUp;
            }
        } else {
            this.timer = 3;
        }
    }

    async enterDeconPlayer(headingUp: boolean, player: Player<RoomType>) {
        await this._enterDecon(headingUp, player, undefined);
    }

    async enterDecon(headingUp: boolean) {
        await this._sendRepair(headingUp ? 1 : 2);
    }

    private async _exitDecon(headingUp: boolean, player: Player<RoomType> | undefined, message: RepairSystemMessage | undefined) {
        if ((this.state & DeconState.Exit) && !!(this.state & DeconState.HeadingUp) === headingUp) {
            return;
        }

        const previousHeadingUp = !!DeconState.HeadingUp;
        this.state = DeconState.Exit;
        if (headingUp) {
            this.state |= DeconState.HeadingUp;
        }
        this.pushDataUpdate();

        const ev = await this.emit(
            new DeconExitEvent(
                this.room,
                this,
                message,
                player,
                headingUp
            )
        );

        this.emitSync(
            new DeconDoorsCloseEvent(
                this.room,
                this,
                undefined
            )
        );

        if (ev.reverted) {
            this.state &= ~DeconState.Exit;
            if (previousHeadingUp) {
                this.state |= DeconState.HeadingUp;
            } else {
                this.state &= ~DeconState.HeadingUp;
            }
        } else {
            this.timer = 3;
        }
    }

    async exitDeconPlayer(headingUp: boolean, player: Player<RoomType>) {
        await this._exitDecon(headingUp, player, undefined);
    }

    async exitDecon(headingUp: boolean) {
        await this._sendRepair(headingUp ? 3 : 4);
    }
    
    handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined) {
        if (this.state !== DeconState.Idle)
            return;

        switch (amount) {
            case 1:
                await this._enterDecon(true, player, rpc);
                break;
            case 2:
                await this._enterDecon(false, player, rpc);
                break;
            case 3:
                await this._exitDecon(true, player, rpc);
                break;
            case 4:
                await this._exitDecon(false, player, rpc);
                break;
        }
        this.timer = 3;
        this.pushDataUpdate();
    }
    
    async fullyRepairHost(): Promise<void> {
        void 0;
    }

    async fullyRepairPlayer(player: Player<RoomType> | undefined): Promise<void> {
        void player;
    }

    async sendFullRepair(player: Player<RoomType>): Promise<void> {
        void player;
    }

    async processFixedUpdate(delta: number) {
        const previous = this.timer;
        this.timer -= delta;

        if (this.timer < 0) {
            this.timer = 0;
        }

        if (this.timer !== previous) {
            if (this.timer <= 0) {
                if (this.state & DeconState.Enter) {
                    this.state = (this.state & ~DeconState.Enter) | DeconState.Closed;
                    this.timer = 3;
                    this.emitSync(
                        new DeconDoorsCloseEvent(
                            this.room,
                            this,
                            undefined
                        )
                    );
                } else if (this.state & DeconState.Closed) {
                    this.state = (this.state & ~DeconState.Closed) | DeconState.Exit;
                    this.timer = 3;
                    this.emitSync(
                        new DeconDoorsOpenEvent(
                            this.room,
                            this,
                            undefined
                        )
                    );
                } else if (this.state & DeconState.Exit) {
                    this.state = DeconState.Idle;
                }
            }
        }
    }
}
