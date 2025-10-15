import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { SystemStatusEvents } from "./events";
import { StatefulRoom } from "../StatefulRoom";

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

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    deserializeFromReader(reader: HazelReader, spawn: boolean) {
        this.cooldown = reader.float();
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    serializeToWriter(writer: HazelWriter, spawn: boolean) {
        writer.float(this.cooldown);
    }

    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined) {
        const system = this.ship.systems.get(amount);

        if (system) {
            await system.handleSabotageByPlayer(player, rpc);

            this.cooldown = 30;
            this.dirty = true;
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
                this.dirty = true;
            }
        }
    }
    
}
