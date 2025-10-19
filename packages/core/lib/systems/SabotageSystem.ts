import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { SystemType } from "@skeldjs/constant";
import { BaseDataMessage, RepairSystemMessage, SabotageSystemDataMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { SystemStatusEvents } from "./events";
import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export type SabotageSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> & ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling system sabotages.
 *
 * See {@link SabotageSystemEvents} for events to listen to.
 */
export class SabotageSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, SabotageSystemEvents<RoomType>> {
    /**
     * The cooldown before another sabotage can happen.
     */
    cooldown: number = 0;

    /**
     * Check whether any systems are currently sabotaged.
     */
    get anySabotaged() {
        return Object.values(this.ship.systems).some(
            system => system?.sabotaged
        );
    }

    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return SabotageSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof SabotageSystemDataMessage) {
            this.cooldown = data.cooldown;
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return new SabotageSystemDataMessage(this.cooldown);
        }
        return undefined;
    }

    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined) {
        const system = this.ship.systems.get(amount);

        if (system) {
            await system.handleSabotageByPlayer(player, rpc);

            this.cooldown = 30;
            this.pushDataUpdate();
        }
    }
    
    async handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined): Promise<void> {
        void player, rpc;
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
        if (this.cooldown > 0 && !this.anySabotaged) {
            this.cooldown -= delta;
            if (this.cooldown <= 0) {
                this.pushDataUpdate();
            }
        }
    }
    
}
