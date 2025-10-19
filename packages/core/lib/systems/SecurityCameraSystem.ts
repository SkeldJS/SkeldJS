import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { SystemType } from "@skeldjs/constant";
import { BaseDataMessage, RepairSystemMessage, SecurityCameraSystemDataMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { SecurityCameraJoinEvent, SecurityCameraLeaveEvent } from "../events";
import { SystemStatusEvents } from "./events";
import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export type SecurityCameraSystemEvents<RoomType extends StatefulRoom> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[SecurityCameraJoinEvent<RoomType>, SecurityCameraLeaveEvent<RoomType>]>;

/**
 * Represents a system responsible for handling players entering and leaving security cameras.
 *
 * See {@link SecurityCameraSystemEvents} for events to listen to.
 */
export class SecurityCameraSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, SecurityCameraSystemEvents<RoomType>> {
    /**
     * The players currently looking at cameras.
     */
    players: Set<Player<RoomType>> = new Set;

    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return SecurityCameraSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof SecurityCameraSystemDataMessage) {
            const before = new Set(this.players);
            this.players.clear();
            for (const playerId of data.playerIds) {
                const player = this.ship.room.getPlayerByPlayerId(playerId);
                if (player && !before.has(player)) {
                    this._addPlayer(player, undefined);
                }
            }
            for (const player of before) {
                if (!this.players.has(player)) {
                    this._removePlayer(player, undefined);
                }
            }
        }
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            const message = new SecurityCameraSystemDataMessage([]);
            for (const player of this.players) {
                const playerId = player.getPlayerId();
                if (playerId !== undefined) {
                    message.playerIds.push(playerId);
                }
            }
            return message;
        }
        return undefined;
    }

    private async _addPlayer(player: Player<RoomType>, rpc: RepairSystemMessage | undefined) {
        this.players.add(player);
        this.pushDataUpdate();

        const ev = await this.emit(
            new SecurityCameraJoinEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.players.delete(player);
        }
    }

    /**
     * Add a player to the security cameras.
     * @param player The player to add.
     * @example
     *```typescript
     * security.addPlayer(client.me);
     * ```
     */
    async joinPlayer(player: Player<RoomType>) {
        await this._addPlayer(player, undefined);
    }

    async join() {
        await this._sendRepair(1);
    }

    private async _removePlayer(player: Player<RoomType>, rpc: RepairSystemMessage | undefined) {
        this.players.delete(player);
        this.pushDataUpdate();

        const ev = await this.emit(
            new SecurityCameraLeaveEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this.players.add(player);
        }
    }

    /**
     * Remove a player from the security cameras.
     * @param player The player to remove.
     * @example
     *```typescript
     * security.removePlayer(client.me);
     * ```
     */
    async leavePlayer(player: Player<RoomType>) {
        await this._removePlayer(player, undefined);
    }

    async leave() {
        await this._sendRepair(0);
    }

    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined) {
        if (!player)
            return;

        if (amount === 1) {
            await this._addPlayer(player, rpc);
        } else {
            await this._removePlayer(player, rpc);
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
