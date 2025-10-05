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

export interface HudOverrideSystemData {
    sabotaged: boolean;
}

export type HudOverrideSystemEvents<RoomType extends StatefulRoom = StatefulRoom> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling communication sabotages on The Skeld and Polus.
 *
 * See {@link HudOverrideSystemEvents} for events to listen to.
 */
export class HudOverrideSystem<RoomType extends StatefulRoom = StatefulRoom> extends SystemStatus<
    HudOverrideSystemData,
    HudOverrideSystemEvents,
    RoomType
> implements HudOverrideSystemData {
    private _sabotaged: boolean;

    /**
     * Whether or not communications is sabotaged.
     */
    get sabotaged() {
        return this._sabotaged;
    }

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | HudOverrideSystemData
    ) {
        super(ship, systemType, data);

        this._sabotaged = false;
    }

    patch(data: HudOverrideSystemData) {
        this._sabotaged = data.sabotaged;
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

    async handleSabotageByPlayer(player: Player | undefined, rpc: RepairSystemMessage | undefined) {
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

    private async _repair(player: Player | undefined, rpc: RepairSystemMessage | undefined) {
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

    async fullyRepairPlayer(player: Player) {
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
