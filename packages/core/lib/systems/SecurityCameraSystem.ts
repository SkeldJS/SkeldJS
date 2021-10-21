import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import { SecurityCameraJoinEvent, SecurityCameraLeaveEvent } from "../events";
import { SystemStatusEvents } from "./events";
import { Hostable } from "../Hostable";

export interface SecurityCameraSystemData {
    players: Set<PlayerData>;
}

export type SecurityCameraSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[SecurityCameraJoinEvent<RoomType>, SecurityCameraLeaveEvent<RoomType>]>;

/**
 * Represents a system responsible for handling players entering and leaving security cameras.
 *
 * See {@link SecurityCameraSystemEvents} for events to listen to.
 */
export class SecurityCameraSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    SecurityCameraSystemData,
    SecurityCameraSystemEvents,
    RoomType
> implements SecurityCameraSystemData {
    /**
     * The players currently looking at cameras.
     */
    players: Set<PlayerData>;

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | SecurityCameraSystemData
    ) {
        super(ship, systemType, data);

        this.players ||= new Set;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const num_players = reader.upacked();

        const before = new Set([...this.players]);
        this.players.clear();
        for (let i = 0; i < num_players; i++) {
            const player = this.ship.room.getPlayerByPlayerId(reader.uint8());
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

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        const players = [...this.players];
        writer.upacked(players.length);
        for (let i = 0; i < players.length; i++) {
            if (players[i].playerId) writer.uint8(players[i].playerId!);
        }
    }

    private async _addPlayer(player: PlayerData, rpc: RepairSystemMessage|undefined) {
        this.players.add(player);
        this.dirty = true;

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
    async addPlayer(player: PlayerData) {
        await this._addPlayer(player, undefined);
    }

    async join() {
        if (!this.room.myPlayer)
            return;

        if (this.room.hostIsMe) {
            await this.addPlayer(this.room.myPlayer);
        } else {
            await this._sendRepair(1);
        }
    }

    private async _removePlayer(player: PlayerData, rpc: RepairSystemMessage|undefined) {
        this.players.delete(player);
        this.dirty = true;

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
    async removePlayer(player: PlayerData) {
        await this._removePlayer(player, undefined);
    }

    async leave() {
        if (!this.room.myPlayer)
            return;

        if (this.room.hostIsMe) {
            await this.removePlayer(this.room.myPlayer);
        } else {
            await this._sendRepair(0);
        }
    }

    async HandleRepair(player: PlayerData<RoomType>|undefined, amount: number, rpc: RepairSystemMessage|undefined) {
        if (!player)
            return;

        if (amount === 1) {
            await this._addPlayer(player, rpc);
        } else {
            await this._removePlayer(player, rpc);
        }
    }
}
