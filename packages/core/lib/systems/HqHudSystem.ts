import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import {
    HqHudConsoleOpenEvent,
    HqHudConsoleCloseEvent,
    HqHudConsoleCompleteEvent,
    HqHudConsolesResetEvent,
    SystemSabotageEvent,
    SystemRepairEvent,
} from "../events";
import { SystemStatusEvents } from "./events";
import { Hostable } from "../Hostable";

export interface UserConsolePair {
    playerId: number;
    consoleId: number;
}

export interface HqHudSystemData {
    activeConsoles: UserConsolePair[];
    completedConsoles: Set<number>;
}

export type HqHudSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<
        [
            HqHudConsolesResetEvent<RoomType>,
            HqHudConsoleOpenEvent<RoomType>,
            HqHudConsoleCloseEvent<RoomType>,
            HqHudConsoleCompleteEvent<RoomType>
        ]
    >;

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
export class HqHudSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    HqHudSystemData,
    HqHudSystemEvents,
    RoomType
> implements HqHudSystemData {
    /**
     * The timer until the consoles are reset.
     */
    timer: number;

    /**
     * The currently opened consoles.
     */
    activeConsoles: UserConsolePair[];

    /**
     * The completed consoles.
     */
    completedConsoles: Set<number>;

    get sabotaged() {
        return this.completedConsoles.size < 2;
    }

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | HqHudSystemData
    ) {
        super(ship, systemType, data);

        this.timer ??= 10000;
        this.activeConsoles ||= [];
        this.completedConsoles ||= new Set([0, 1]);
    }

    private _getIdx(consoleId: number, playerId: number) {
        return this.activeConsoles.findIndex(
            (pair) => pair.consoleId === consoleId && pair.playerId === playerId
        );
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const numActive = reader.upacked();

        const beforeActive = this.activeConsoles;
        this.activeConsoles = [];
        for (let i = 0; i < numActive; i++) {
            const playerId = reader.uint8();
            const consoleId = reader.uint8();

            const player = this.ship.room.getPlayerByPlayerId(playerId);
            if (player) {
                this._openConsole(consoleId, player, undefined);
            }
        }

        for (let i = 0; i < beforeActive.length; i++) {
            const console = beforeActive[i];
            const idx = this._getIdx(console.consoleId, console.playerId);
            const player = this.ship.room.getPlayerByPlayerId(console.playerId);
            if (player && idx === -1) {
                this._closeConsole(console.consoleId, player, undefined);
            }
        }

        const beforeCompleted = this.completedConsoles.size;
        const numCompleted = reader.upacked();
        for (let i = 0; i < numCompleted; i++) {
            this._completeConsole(reader.uint8(), undefined, undefined);
        }
        if (beforeCompleted === 2 && numCompleted === 0) {
            this.emitSync(
                new SystemSabotageEvent(
                    this.room,
                    this,
                    undefined,
                    undefined
                )
            );
        }
        if (beforeCompleted < 2 && numCompleted === 2) {
            this.emitSync(
                new SystemRepairEvent(
                    this.room,
                    this,
                    undefined,
                    undefined
                )
            );
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.upacked(this.activeConsoles.length);

        for (let i = 0; i < this.activeConsoles.length; i++) {
            const active = this.activeConsoles[i];

            writer.uint8(active.playerId);
            writer.uint8(active.consoleId);
        }

        const completed = [...this.completedConsoles];
        writer.upacked(completed.length);

        for (let i = 0; i < completed.length; i++) {
            writer.uint8(completed[i]);
        }
    }

    async HandleSabotage(player: PlayerData<RoomType>|undefined, rpc: RepairSystemMessage|undefined) {
        const oldTimer = this.timer;
        const oldActive = this.activeConsoles;
        const oldCompleted = this.completedConsoles;
        this.timer = -1;
        this.activeConsoles = [];
        this.completedConsoles = new Set;
        this.dirty = true;

        const ev = await this.emit(
            new SystemSabotageEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.timer = oldTimer;
            this.activeConsoles = oldActive;
            this.completedConsoles = oldCompleted;
        }
    }

    private async _resetConsoles() {
        const oldCompleted = this.completedConsoles;
        this.completedConsoles = new Set;
        this.dirty = true;

        const ev = await this.emit(
            new HqHudConsolesResetEvent(
                this.room,
                this
            )
        );

        if (ev.reverted) {
            this.completedConsoles = oldCompleted;
        }
    }

    private async _openConsole(consoleId: number, player: PlayerData, rpc: RepairSystemMessage|undefined) {
        if (player.playerId === undefined)
            return;

        const idx = this._getIdx(consoleId, player.playerId);

        if (idx === -1) {
            const consoleEntry = { consoleId, playerId: player.playerId };
            this.activeConsoles.push(consoleEntry);
            this.dirty = true;
            const ev = await this.emit(
                new HqHudConsoleOpenEvent(
                    this.room,
                    this,
                    rpc,
                    player,
                    consoleId
                )
            );
            if (ev.reverted) {
                const newIdx = this.activeConsoles.indexOf(consoleEntry);
                if (newIdx > -1) this.activeConsoles.splice(newIdx, 1);
                return;
            }
            if (ev.alteredConsoleId !== consoleId) {
                consoleEntry.consoleId = ev.alteredConsoleId;
            }
        }
    }

    async openConsoleAs(consoleId: number, player: PlayerData) {
        await this._openConsole(consoleId, player, undefined);
    }

    /**
     * Mark the console as being used by your player.
     * @param consoleId The ID of the console to mark as being used.
     */
    async openConsole(consoleId: number) {
        if (!this.room.myPlayer)
            return;

        if (this.ship.canBeManaged()) {
            await this.openConsoleAs(consoleId, this.room.myPlayer);
        } else {
            this._sendRepair(0x40 | consoleId);
        }
    }

    private async _closeConsole(consoleId: number, player: PlayerData, rpc: RepairSystemMessage|undefined) {
        if (player.playerId === undefined)
            return;

        const idx = this._getIdx(consoleId, player.playerId);

        if (idx > -1) {
            const consoleEntry = this.activeConsoles[idx];
            this.activeConsoles.splice(idx, 1);
            this.dirty = true;
            const ev = await this.emit(
                new HqHudConsoleCloseEvent(
                    this.room,
                    this,
                    rpc,
                    player,
                    consoleId
                )
            );
            if (ev.reverted) {
                this.activeConsoles.splice(idx, 0, consoleEntry);
            }
        }
    }

    async closeConsoleAs(consoleId: number, player: PlayerData) {
        await this._closeConsole(consoleId, player, undefined);
    }

    /**
     * Mark the console as no longer being used by your player.
     * @param consoleId The ID of the console to mark as not being used.
     */
    async closeConsole(consoleId: number) {
        if (!this.room.myPlayer)
            return;

        if (this.ship.canBeManaged()) {
            await this.closeConsoleAs(consoleId, this.room.myPlayer);
        } else {
            await this._sendRepair(0x20 | consoleId);
        }
    }

    private async _completeConsole(consoleId: number, player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        if (!this.completedConsoles.has(consoleId)) {
            this.completedConsoles.add(consoleId);
            this.dirty = true;
            const ev = await this.emit(
                new HqHudConsoleCompleteEvent(
                    this.room,
                    this,
                    rpc,
                    player,
                    consoleId
                )
            );
            if (ev.reverted) {
                this.completedConsoles.delete(consoleId);
            }
        }
    }

    /**
     * Mark a console as completed.
     * @param consoleId The ID of the console to mark as completed.
     */
    async completeConsole(consoleId: number) {
        if (this.ship.canBeManaged()) {
            await this._completeConsole(consoleId, this.room.myPlayer, undefined);
        } else {
            await this._sendRepair(0x10 | consoleId);
        }
    }

    private async _repair(player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        const completedBefore = this.completedConsoles;
        const timerBefore = this.timer;
        this.completedConsoles = new Set([0, 1]);
        this.timer = -1;
        this.dirty = true;
        const ev = await this.emit(
            new SystemRepairEvent(
                this.room,
                this,
                rpc,
                player
            )
        );
        if(ev.reverted) {
            this.timer = timerBefore;
            this.completedConsoles = completedBefore;
        }
    }

    async repair() {
        if (this.ship.canBeManaged()) {
            await this._repair(this.room.myPlayer, undefined);
        } else {
            await this.completeConsole(0);
            await this.completeConsole(1);
        }
    }

    async HandleRepair(player: PlayerData|undefined, amount: number, rpc: RepairSystemMessage|undefined) {
        const consoleId = amount & 0xf;
        const repairOperation = amount & 0xf0;

        switch (repairOperation) {
            case HqHudSystemRepairTag.CompleteConsole:
                await this._completeConsole(consoleId, player, rpc);
                if (this.completedConsoles.size >= 2) {
                    await this._repair(player, rpc);
                }
                break;
            case HqHudSystemRepairTag.CloseConsole:
                if (!player)
                    return;

                await this._closeConsole(consoleId, player, rpc);
                break;
            case HqHudSystemRepairTag.OpenConsole:
                if (!player)
                    return;

                await this._openConsole(consoleId, player, rpc);
                break;
        }
    }

    Detoriorate(delta: number) {
        if (!this.sabotaged)
            return;

        this.timer -= delta;
        if (this.timer < 0) {
            this.timer = 10;
            this.dirty = true;
            this._resetConsoles();
        }
    }
}
