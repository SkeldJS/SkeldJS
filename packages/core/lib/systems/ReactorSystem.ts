import { HazelReader, HazelWriter } from "@skeldjs/util";
import { GameOverReason, SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import {
    ReactorConsoleAddEvent,
    ReactorConsoleRemoveEvent,
    ReactorConsolesResetEvent,
    SystemSabotageEvent
} from "../events";

import { SystemStatusEvents } from "./events";
import { Hostable } from "../Hostable";
import { AmongUsEndGames, EndGameIntent } from "../endgame";

export interface ReactorSystemData {
    timer: number;
    completed: Set<number>;
}

export type ReactorSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[
        ReactorConsoleAddEvent<RoomType>,
        ReactorConsoleRemoveEvent<RoomType>,
        ReactorConsolesResetEvent<RoomType>
    ]>;

/**
 * Represents a system responsible for handling reactor consoles.
 *
 * See {@link ReactorSystemEvents} for events to listen to.
 */

export class ReactorSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    ReactorSystemData,
    ReactorSystemEvents,
    RoomType
> implements ReactorSystemData {
    /**
     * The timer before the reactor explodes.
     */
    timer: number;

    /**
     * The completed consoles.
     */
    completed: Set<number>;

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | ReactorSystemData
    ) {
        super(ship, systemType, data);

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
            this.completed.delete(ev.consoleId);
            return;
        }

        if (ev.alteredConsoleId !== consoleid) {
            this.completed.delete(consoleid);
            this.completed.add(ev.alteredConsoleId);
        }

        if (this.completed.size >= 2) {
            await this._repair(player, rpc);
        }
    }

    /**
     * Add a completed console. (Same as a player placing their hand on a
     * console)
     * @param consoleid The ID of the console to add.
     */
    async addConsole(consoleid: number) {
        if (this.room.hostIsMe) {
            await this._addConsole(this.room.myPlayer, consoleid, undefined);
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

    /**
     * Remove a completed console. (Same as a player removing their hand from a
     * console)
     * @param consoleid The ID of the console to add.
     */
    async removeConsole(consoleid: number) {
        if (this.room.hostIsMe) {
            await this._removeConsole(this.room.myPlayer, consoleid, undefined);
        } else {
            await this._sendRepair(0x20 | consoleid);
        }
    }

    async HandleSabotage(player: PlayerData<RoomType>|undefined, rpc: RepairSystemMessage|undefined) {
        this.timer = 45;
        const oldCompleted = this.completed;
        this.completed = new Set;

        const ev = await this.emit(
            new SystemSabotageEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.timer = 10000;
            this.completed = oldCompleted;
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
        if (this.room.hostIsMe) {
            await this._repair(this.room.myPlayer, undefined);
        } else {
            await this._sendRepair(0x10);
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async HandleRepair(player: PlayerData<RoomType>|undefined, amount: number, rpc: RepairSystemMessage|undefined) {
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
        if (!this.sabotaged)
            return;

        this.timer -= delta;
        this._lastUpdate += delta;

        if (this._lastUpdate > 2) {
            this._lastUpdate = 0;
            this.dirty = true;
        }

        if (this.timer <= 0) {
            this.room.registerEndGameIntent(
                new EndGameIntent(
                    AmongUsEndGames.ReactorSabotage,
                    GameOverReason.ImpostorBySabotage,
                    {}
                )
            );
        }
    }
}
