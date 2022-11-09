import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import { SystemStatusEvents } from "./events";
import { Hostable } from "../Hostable";

import {
    DeconDoorsCloseEvent,
    DeconDoorsOpenEvent,
    DeconEnterEvent,
    DeconExitEvent
} from "../events";

export const DeconState = {
    Idle: 0x0,
    Enter: 0x1,
    Closed: 0x2,
    Exit: 0x4,
    HeadingUp: 0x8,
};

export interface DeconSystemData {
    timer: number;
    state: number;
}

export type DeconSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents<RoomType> & ExtractEventTypes<[
    DeconDoorsCloseEvent,
    DeconDoorsOpenEvent,
    DeconEnterEvent,
    DeconExitEvent
]>;
/**
 * Represents a system responsible for the decontamination doors.
 *
 * See {@link DeconSystemEvents} for events to listen to.
 */
export class DeconSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    DeconSystemData,
    DeconSystemEvents,
    RoomType
> implements DeconSystemData {
    /**
     * How long before decontamination doors open.
     */
    timer: number;

    /**
     * The state of the decontamination system, to be calculated with {@link DeconState}
     */
    state: number;

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | DeconSystemData
    ) {
        super(ship, systemType, data);

        this.timer ||= 0;
        this.state ||= DeconState.Idle;
    }

    Deserialize(reader: HazelReader, spawn: boolean) {
        const previousState = this.state;
        this.timer = reader.byte();
        this.state = reader.byte();

        if ((previousState & DeconState.Closed) && !(this.state & DeconState.Closed)) {
            if (this.state & DeconState.Enter) {
                this.emitSync(new DeconEnterEvent(this.room, this, undefined, undefined, (this.state & DeconState.HeadingUp) > 0));
            } else if (this.state & DeconState.Exit) {
                this.emitSync(new DeconExitEvent(this.room, this, undefined, undefined, (this.state & DeconState.HeadingUp) > 0));
            }
        }

        if (!(previousState & DeconState.Closed) && (this.state & DeconState.Closed)) {
            this.emitSync(new DeconDoorsCloseEvent(this.room, this, undefined));
        } else if ((previousState & DeconState.Closed) && !(this.state & DeconState.Closed)) {
            this.emitSync(new DeconDoorsOpenEvent(this.room, this, undefined));
        }

        this.dirty = spawn;
    }

    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.byte(Math.ceil(this.timer));
        writer.byte(this.state);
    }

    private async _enterDecon(headingUp: boolean, player: PlayerData|undefined, message: RepairSystemMessage|undefined) {
        if ((this.state & DeconState.Enter) && !!(this.state & DeconState.HeadingUp) === headingUp) {
            return;
        }

        const previousHeadingUp = !!DeconState.HeadingUp;
        this.state = DeconState.Enter & ~DeconState.Closed;
        if (headingUp) {
            this.state |= DeconState.HeadingUp;
        }
        this.dirty = true;

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

    async enterDecon(headingUp: boolean) {
        if (this.ship.canBeManaged()) {
            await this._enterDecon(headingUp, this.room.myPlayer, undefined);
        } else {
            await this._sendRepair(headingUp ? 1 : 2);
        }
    }

    private async _exitDecon(headingUp: boolean, player: PlayerData|undefined, message: RepairSystemMessage|undefined) {
        if ((this.state & DeconState.Exit) && !!(this.state & DeconState.HeadingUp) === headingUp) {
            return;
        }

        const previousHeadingUp = !!DeconState.HeadingUp;
        this.state = DeconState.Exit;
        if (headingUp) {
            this.state |= DeconState.HeadingUp;
        }
        this.dirty = true;

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

    async exitDecon(headingUp: boolean) {
        if (this.ship.canBeManaged()) {
            await this._exitDecon(headingUp, this.room.myPlayer, undefined);
        } else {
            await this._sendRepair(headingUp ? 3 : 4);
        }
    }

    async HandleRepair(player: PlayerData|undefined, amount: number, rpc: RepairSystemMessage|undefined) {
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
        this.dirty = true;
    }

    Detoriorate(delta: number) {
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
