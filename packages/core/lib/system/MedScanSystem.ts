import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { SystemStatusEvents } from "./events";
import { MedScanJoinQueueEvent, MedScanLeaveQueueEvent } from "../events";

export interface MedScanSystemData {
    queue: PlayerData[];
}

export type MedScanSystemEvents = SystemStatusEvents &
    ExtractEventTypes<[
        MedScanJoinQueueEvent,
        MedScanLeaveQueueEvent
    ]>;

/**
 * Represents a system responsible for handling the medbay scan queue.
 *
 * See {@link MedScanSystemEvents} for events to listen to.
 */
export class MedScanSystem extends SystemStatus<
    MedScanSystemData,
    MedScanSystemEvents
> implements MedScanSystemData {
    static systemType = SystemType.MedBay as const;
    systemType = SystemType.MedBay as const;

    /**
     * The current queue to access the medbay scan.s
     */
    queue: PlayerData[];

    constructor(ship: InnerShipStatus, data?: HazelReader | MedScanSystemData) {
        super(ship, data);

        this.queue ||= [];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const num_players = reader.upacked();

        this.queue = [];
        for (let i = 0; i < num_players; i++) {
            const player = this.ship.room.getPlayerByPlayerId(reader.uint8());
            if (player) this.queue.push(player);
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.upacked(this.queue.length);

        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].playerId) writer.uint8(this.queue[i].playerId!);
        }
    }

    private _removeFromQueue(player: PlayerData) {
        const idx = this.queue.indexOf(player);
        if (~idx) {
            this.queue.splice(idx, 1);
        }
    }

    private async _joinQueue(player: PlayerData, rpc: RepairSystemMessage|undefined) {
        this._removeFromQueue(player);
        this.queue.push(player);

        const ev = await this.emit(
            new MedScanJoinQueueEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this._removeFromQueue(player);
        }
    }

    async addToQueue(player: PlayerData) {
        await this._joinQueue(player, undefined);
    }

    async joinQueue() {
        if (!this.room.me)
            return;

        await this.addToQueue(this.room.me);
    }

    private async _leaveQueue(player: PlayerData, rpc: RepairSystemMessage|undefined) {
        this._removeFromQueue(player);

        const ev = await this.emit(
            new MedScanLeaveQueueEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.queue.push(player);
        }
    }

    async removeFromQueue(player: PlayerData) {
        await this._leaveQueue(player, undefined);
    }

    async leaveQueue() {
        if (!this.room.me)
            return;

        await this.removeFromQueue(this.room.me);
    }

    async HandleRepair(player: PlayerData, amount: number, rpc: RepairSystemMessage|undefined) {
        const playerId = amount & 0x1f;
        const resolved = this.ship.room.getPlayerByPlayerId(playerId);

        if (resolved) {
            if (amount & 0x80) {
                await this._joinQueue(resolved, rpc);
            } else if (amount & 0x40) {
                await this._leaveQueue(resolved, rpc);
            }
        }
    }
}
