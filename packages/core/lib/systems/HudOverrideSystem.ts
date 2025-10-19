import { HazelReader } from "@skeldjs/hazel";
import { BaseDataMessage, HudOverrideSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { SystemRepairEvent, SystemSabotageEvent } from "../events";
import { SystemStatusEvents } from "./events";
import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";


export type HudOverrideSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling communication sabotages on The Skeld and Polus.
 *
 * See {@link HudOverrideSystemEvents} for events to listen to.
 */
export class HudOverrideSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, HudOverrideSystemEvents<RoomType>> {
    private isSabotaged: boolean = false;

    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return HudOverrideSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof HudOverrideSystemDataMessage) {
            this.isSabotaged = data.isSabotaged;
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return new HudOverrideSystemDataMessage(this.isSabotaged);
        }
        return undefined;
    }

    async handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined) {
        this.isSabotaged = true;
        this.pushDataUpdate();

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
        this.isSabotaged = false;
        this.pushDataUpdate();

        const ev = await this.emit(
            new SystemRepairEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.isSabotaged = true;
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
