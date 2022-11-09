import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import { SystemStatusEvents } from "./events";
import { MedScanJoinQueueEvent, MedScanLeaveQueueEvent } from "../events";
import { Hostable } from "../Hostable";

export interface MedScanSystemData {
    queue: PlayerData[];
}

export type MedScanSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[
        MedScanJoinQueueEvent<RoomType>,
        MedScanLeaveQueueEvent<RoomType>
    ]>;

/**
 * Represents a system responsible for handling the medbay scan queue.
 *
 * See {@link MedScanSystemEvents} for events to listen to.
 */
export class MedScanSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    MedScanSystemData,
    MedScanSystemEvents,
    RoomType
> implements MedScanSystemData {
    /**
     * The current queue to access the medbay scan.s
     */
    queue: PlayerData<RoomType>[];

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | MedScanSystemData
    ) {
        super(ship, systemType, data);

        this.queue ||= [];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const numPlayers = reader.upacked();

        this.queue = [];
        for (let i = 0; i < numPlayers; i++) {
            const player = this.ship.room.getPlayerByPlayerId(reader.uint8());
            if (player) this.queue.push(player);
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.upacked(this.queue.length);

        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].playerId)
                writer.uint8(this.queue[i].playerId!);
        }
    }

    private _removeFromQueue(player: PlayerData<RoomType>) {
        const idx = this.queue.indexOf(player);
        if (~idx) {
            this.queue.splice(idx, 1);
        }
    }

    private async _joinQueue(player: PlayerData<RoomType>, rpc: RepairSystemMessage|undefined) {
        if (this.queue.includes(player))
            return;

        this._removeFromQueue(player);
        this.queue.push(player);
        this.dirty = true;

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
    async addToQueue(player: PlayerData<RoomType>) {
        if (player.playerId === undefined)
            return;

        if (this.ship.canBeManaged()) {
            await this._joinQueue(player, undefined);
        } else {
            await this._sendRepair(player.playerId | 0x80);
        }
    }

    /**
     * Join the queue as the client's player.
     */
    async joinQueue() {
        if (!this.room.myPlayer)
            return;

        await this.addToQueue(this.room.myPlayer);
    }

    private async _leaveQueue(player: PlayerData<RoomType>, rpc: RepairSystemMessage|undefined) {
        if (!this.queue.includes(player))
            return;

        this._removeFromQueue(player);
        this.dirty = true;

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
    async removeFromQueue(player: PlayerData<RoomType>) {
        if (player.playerId === undefined)
            return;

        if (this.ship.canBeManaged()) {
            await this._leaveQueue(player, undefined);
        } else {
            await this._sendRepair(player.playerId | 0x40);
        }
    }

    /**
     * Leave the queue as the current player.
     */
    async leaveQueue() {
        if (!this.room.myPlayer)
            return;

        await this.removeFromQueue(this.room.myPlayer);
    }

    async HandleRepair(player: PlayerData<RoomType>|undefined, amount: number, rpc: RepairSystemMessage|undefined) {
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
