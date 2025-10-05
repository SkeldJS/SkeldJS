import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { SystemRepairEvent, SystemSabotageEvent } from "../events";
import { SystemStatusEvents } from "./events";
import { StatefulRoom } from "../StatefulRoom";


export type HudOverrideSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling communication sabotages on The Skeld and Polus.
 *
 * See {@link HudOverrideSystemEvents} for events to listen to.
 */
export class HudOverrideSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, HudOverrideSystemEvents<RoomType>> {
    private _sabotaged: boolean = false;

    /**
     * Whether or not communications is sabotaged.
     */
    get sabotaged() {
        return this._sabotaged;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    deserializeFromReader(reader: HazelReader, spawn: boolean) {
        const before = this.sabotaged;
        this._sabotaged = reader.bool();

        if (!before && this._sabotaged)
            this.emitSync(
                new SystemSabotageEvent(
                    this.room,
                    this,
                    undefined,
                    undefined
                )
            );
        if (before && !this._sabotaged)
            this.emitSync(
                new SystemRepairEvent(
                    this.room,
                    this,
                    undefined,
                    undefined
                )
            );
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    serializeToWriter(writer: HazelWriter, spawn: boolean) {
        writer.bool(this.sabotaged);
    }

    async handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        this._sabotaged = true;
        this.dirty = true;

        await this.emit(
            new SystemSabotageEvent(
                this.room,
                this,
                rpc,
                player
            )
        );
    }

    private async _repair(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        this._sabotaged = false;
        this.dirty = true;

        const ev = await this.emit(
            new SystemRepairEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this._sabotaged = true;
        }
    }

    async fullyRepairHost(): Promise<void> {
        await this._repair(undefined, undefined);
    }

    async fullyRepairPlayer(player: Player<RoomType>) {
        await this._repair(player, undefined);
    }

    async sendFullRepair() {
        await this._sendRepair(0);
    }

    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined) {
        if (amount === 0) {
            await this._repair(player, rpc);
        }
    }
    
    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }
}
