import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

export interface SecurityCameraSystemData {
    players: Set<number>;
}

export class SecurityCameraSystem extends SystemStatus {
    static systemType = SystemType.Security as const;
    systemType = SystemType.Security as const;
    
    players: Set<PlayerData>;

    constructor(ship: BaseShipStatus, data?: HazelBuffer|SecurityCameraSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const num_players = reader.upacked();

        this.players = new Set;
        for (let i = 0; i < num_players; i++) {
            const player = this.ship.room.getPlayerByPlayerId(reader.uint8());
            this.players.add(player);
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        const players = Array.from(this.players);
        writer.upacked(players.length);

        for (let i = 0; i < players.length; i++) {
            writer.uint8(players[i].playerId);
        }
    }

    HandleRepair(control: PlayerData, amount: number) {
        if (amount === 1) {
            this.players.add(control);
        } else {
            this.players.delete(control);
        }
    }
}