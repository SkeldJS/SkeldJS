import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { ShipStatus } from "../component/ShipStatus";
import { SystemStatus } from "./SystemStatus";

export interface SecurityCameraSystemData {
    players: number[];
}

export class SecurityCameraSystem extends SystemStatus {
    static systemType = SystemType.Security as const;
    systemType = SystemType.Security as const;
    
    players: number[];

    constructor(ship: ShipStatus, data?: HazelBuffer|SecurityCameraSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const num_players = reader.upacked();

        this.players = [];
        for (let i = 0; i < num_players; i++) {
            this.players.push(reader.uint8());
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.upacked(this.players.length);

        for (let i = 0; i < this.players.length; i++) {
            writer.uint8(this.players[i]);
        }
    }
}