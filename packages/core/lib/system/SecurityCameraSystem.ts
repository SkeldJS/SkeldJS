import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import { SecurityCameraJoinEvent, SecurityCameraLeaveEvent } from "../events";
import { ExtractEventTypes } from "@skeldjs/events";
import { SystemStatusEvents } from "./events";
import { RepairSystemMessage } from "@skeldjs/protocol";

export interface SecurityCameraSystemData {
    players: Set<PlayerData>;
}

export type SecurityCameraSystemEvents = SystemStatusEvents &
    ExtractEventTypes<[SecurityCameraJoinEvent, SecurityCameraLeaveEvent]>;

/**
 * Represents a system responsible for handling players entering and leaving security cameras.
 *
 * See {@link SecurityCameraSystemEvents} for events to listen to.
 */
export class SecurityCameraSystem extends SystemStatus<
    SecurityCameraSystemData,
    SecurityCameraSystemEvents
> implements SecurityCameraSystemData {
    static systemType = SystemType.Security as const;
    systemType = SystemType.Security as const;

    /**
     * The players currently looking at cameras.
     */
    players: Set<PlayerData>;

    constructor(
        ship: InnerShipStatus,
        data?: HazelReader | SecurityCameraSystemData
    ) {
        super(ship, data);

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
        if (!this.room.me)
            return;

        await this.addPlayer(this.room.me);
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
        if (!this.room.me)
            return;

        await this.removePlayer(this.room.me);
    }

    async HandleRepair(player: PlayerData, amount: number, rpc: RepairSystemMessage) {
        if (amount === 1) {
            await this._addPlayer(player, rpc);
        } else {
            await this._removePlayer(player, rpc);
        }
    }
}
