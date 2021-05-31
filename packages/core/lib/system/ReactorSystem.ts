import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { ExtractEventTypes } from "@skeldjs/events";
import { SystemStatusEvents } from "./events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ReactorConsoleAddEvent, ReactorConsoleRemoveEvent, ReactorConsolesResetEvent } from "../events";

export interface ReactorSystemData {
    timer: number;
    completed: Set<number>;
}

export type ReactorSystemEvents = SystemStatusEvents &
    ExtractEventTypes<[
        ReactorConsoleAddEvent,
        ReactorConsoleRemoveEvent,
        ReactorConsolesResetEvent
    ]>;

/**
 * Represents a system responsible for handling reactor consoles.
 *
 * See {@link ReactorSystemEvents} for events to listen to.
 */

export class ReactorSystem extends SystemStatus<
    ReactorSystemData,
    ReactorSystemEvents
> implements ReactorSystemData {
    static systemType = SystemType.Reactor as const;
    systemType = SystemType.Reactor as const;

    /**
     * The timer before the reactor explodes.
     */
    timer: number;

    /**
     * The completed consoles.
     */
    completed: Set<number>;

    constructor(ship: InnerShipStatus, data?: HazelReader | ReactorSystemData) {
        super(ship, data);

        this.timer ??= 10000;
        this.completed ||= new Set;
    }

    get sabotaged() {
        return this.timer < 10000;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        this.timer = reader.float();

        const num_consoles = reader.upacked();
        this.completed.clear();
        for (let i = 0; i < num_consoles; i++) {
            this.completed.add(reader.upacked());
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.float(this.timer);
        const completed = [...this.completed];
        writer.upacked(completed.length);
        for (let i = 0; i < completed.length; i++) {
            writer.upacked(completed[i]);
        }
    }

    private async _addConsole(player: PlayerData|undefined, consoleid: number, rpc: RepairSystemMessage|undefined) {
        this.completed.add(consoleid);
        this.dirty = true;

        const ev = await this.emit(
            new ReactorConsoleAddEvent(
                this.room,
                this,
                undefined,
                player,
                consoleid
            )
        );

        if (ev.reverted) {
            return this.completed.delete(ev.consoleId);
        }

        if (ev.alteredConsoleId !== consoleid) {
            this.completed.delete(consoleid);
            this.completed.add(ev.alteredConsoleId);
        }
    }

    async addConsole(consoleid: number) {
        if (this.room.amhost) {
            await this._addConsole(this.room.me, consoleid, undefined);
        } else {
            await this._sendRepair(0x40 | consoleid);
        }
    }

    private async _removeConsole(player: PlayerData|undefined, consoleid: number, rpc: RepairSystemMessage|undefined) {
        this.completed.delete(consoleid);
        this.dirty = true;

        const ev = await this.emit(
            new ReactorConsoleRemoveEvent(
                this.room,
                this,
                undefined,
                player,
                consoleid
            )
        );

        if (ev.reverted) {
            return this.completed.add(ev.consoleId);
        }

        if (ev.alteredConsoleId !== consoleid) {
            this.completed.add(consoleid);
            this.completed.delete(ev.alteredConsoleId);
        }
    }

    async removeConsole(consoleid: number) {
        if (this.room.amhost) {
            await this._removeConsole(this.room.me, consoleid, undefined);
        } else {
            await this._sendRepair(0x20 | consoleid);
        }
    }

    private async _repair(player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        const oldTimer = this.timer;
        const oldCompleted = this.completed;
        this.timer = 10000;
        this.completed = new Set;
        this.dirty = true;

        const ev = await this.emit(
            new ReactorConsolesResetEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.timer = oldTimer;
            this.completed = oldCompleted;
        }
    }

    async repair() {
        if (this.room.amhost) {
            await this._repair(this.room.me, undefined);
        } else {
            await this._sendRepair(0x10);
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async HandleRepair(player: PlayerData, amount: number, rpc: RepairSystemMessage|undefined) {
        const consoleId = amount & 0x3;

        if (amount & 0x40) {
            await this._addConsole(player, consoleId, rpc);
        } else if (amount & 0x20) {
            await this._removeConsole(player, consoleId, rpc);
        } else if (amount & 0x10) {
            await this._repair(player, rpc);
        }

        this.dirty = true;
    }

    private _lastUpdate = 0;
    Detoriorate(delta: number) {
        if (!this.sabotaged) return;

        this.timer -= delta;
        this._lastUpdate += delta;

        if (this._lastUpdate > 2) {
            this._lastUpdate = 0;
            this.dirty = true;
        }
    }
}
