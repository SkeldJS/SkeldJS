import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import { SecurityCameraJoinEvent, SecurityCameraLeaveEvent } from "../events";
import { ExtractEventTypes } from "@skeldjs/events";
import { SystemStatusEvents } from "./events";

export interface SecurityCameraSystemData {
    players: Set<number>;
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
> {
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
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const num_players = reader.upacked();

        const before = new Set([...this.players]);
        this.players.clear();
        for (let i = 0; i < num_players; i++) {
            const player = this.ship.room.getPlayerByPlayerId(reader.uint8());
            if (player && !before.has(player)) {
                this._addPlayer(player);
            }
        }
        for (const player of before) {
            if (!this.players.has(player)) {
                this._removePlayer(player);
            }
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        const players = [...this.players];
        writer.upacked(players.length);
        for (let i = 0; i < players.length; i++) {
            writer.uint8(players[i].playerId);
        }
    }

    HandleRepair(player: PlayerData, amount: number) {
        if (amount === 1) {
            this._addPlayer(player);
        } else {
            this._removePlayer(player);
        }
        this.dirty = true;
    }

    private _addPlayer(player: PlayerData) {
        this.players.add(player);
        this.emit(new SecurityCameraJoinEvent(this.ship?.room, this, player));
    }

    private _removePlayer(player: PlayerData) {
        this.players.delete(player);
        this.emit(new SecurityCameraLeaveEvent(this.ship?.room, this, player));
    }

    /**
     * Add a player to the security cameras.
     * @param player The player to add.
     * @example
     *```typescript
     * security.addPlayer(client.me);
     * ```
     */
    addPlayer(player: PlayerData) {
        this.repair(player, 1);
    }

    /**
     * Remove a player from the security cameras.
     * @param player The player to remove.
     * @example
     *```typescript
     * security.removePlayer(client.me);
     * ```
     */
    removePlayer(player: PlayerData) {
        this.repair(player, 0);
    }
}
