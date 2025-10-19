import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { SystemType } from "@skeldjs/constant";
import { BaseDataMessage, MedScanSystemDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { SystemStatusEvents } from "./events";
import { MedScanJoinQueueEvent, MedScanLeaveQueueEvent } from "../events";
import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export type MedScanSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[
        MedScanJoinQueueEvent<RoomType>,
        MedScanLeaveQueueEvent<RoomType>
    ]>;

/**
 * Represents a system responsible for handling the medbay scan queue.
 *
 * See {@link MedScanSystemEvents} for events to listen to.
 */
export class MedScanSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, MedScanSystemEvents<RoomType>> {
    /**
     * The current queue to access the medbay scan.
     */
    queue: Player<RoomType>[] = [];

    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return MedScanSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof MedScanSystemDataMessage) {
            this.queue = [];
            for (const playerId of data.playerIdQueue) {
                const player = this.ship.room.getPlayerByPlayerId(playerId);
                if (player) this.queue.push(player);
            }
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            const message = new MedScanSystemDataMessage([]);
            for (const player of this.queue) {
                const playerId = player.getPlayerId();
                if (playerId !== undefined) {
                    message.playerIdQueue.push(playerId);
                }
            }
            return message;
        }
        return undefined;
    }

    private _removeFromQueue(player: Player<RoomType>) {
        const idx = this.queue.indexOf(player);
        if (~idx) {
            this.queue.splice(idx, 1);
        }
    }

    private async _joinQueue(player: Player<RoomType>, rpc: RepairSystemMessage | undefined) {
        if (this.queue.includes(player))
            return;

        this._removeFromQueue(player);
        this.queue.push(player);
        this.pushDataUpdate();

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

    /**
     * Add a player to the queue.
     * @param player The player to add.
     */
    async addToQueuePlayer(player: Player<RoomType>) {
        const playerId = player.getPlayerId();
        if (playerId === undefined)
            return;

        if (this.ship.room.canManageObject(this.ship)) {
            await this._joinQueue(player, undefined);
        } else {
            await this._sendRepair(playerId | 0x80);
        }
    }


    private async _leaveQueue(player: Player<RoomType>, rpc: RepairSystemMessage | undefined) {
        if (!this.queue.includes(player))
            return;

        this._removeFromQueue(player);
        this.pushDataUpdate();

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

    /**
     * Remove a player from the queue.
     * @param player The player to remove.
     */
    async removeFromQueuePlayer(player: Player<RoomType>) {
        const playerId = player.getPlayerId();
        if (playerId === undefined)
            return;

        if (this.ship.room.canManageObject(this.ship)) {
            await this._leaveQueue(player, undefined);
        } else {
            await this._sendRepair(playerId | 0x40);
        }
    }

    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined) {
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
    
    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
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
}
