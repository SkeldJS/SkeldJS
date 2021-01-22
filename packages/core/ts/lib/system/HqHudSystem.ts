import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

export interface UserConsolePair {
    playerId: number;
    consoleId: number;
}

export interface HqHudSystemData {
    active: UserConsolePair[];
    completed: number[];
}

export type HqHudSystemEvents = {

}

export class HqHudSystem extends SystemStatus<HqHudSystemEvents> {
    static systemType = SystemType.Communications as const;
    systemType = SystemType.Communications as const;
    
    active: UserConsolePair[];
    completed: number[];

    constructor(ship: BaseShipStatus, data?: HazelBuffer|HqHudSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const num_active = reader.upacked();

        this.active = [];
        for (let i = 0; i < num_active; i++) {
            const playerId = reader.uint8();
            const consoleId = reader.uint8();

            this.active.push({ playerId, consoleId });
        }

        const num_completed = reader.upacked();

        this.completed = [];
        for (let i = 0; i < num_completed; i++) {
            this.completed.push(reader.uint8());
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.upacked(this.active.length);

        for (let i = 0; i < this.active.length; i++) {
            const active = this.active[i];

            writer.uint8(active.playerId);
            writer.uint8(active.consoleId);
        }
        
        writer.upacked(this.completed.length);

        for (let i = 0; i < this.completed.length; i++) {
            writer.uint8(this.completed[i]);
        }
    }

    HandleRepair(control: PlayerData, amount: number) {
        const consoleId = amount & 0xF;

        const idx = this.active.findIndex(pair => pair.playerId === control.playerId);
        
        if (amount & 0x40) {
            if (!~idx) {
                this.active.push({
                    consoleId,
                    playerId: control.playerId
                });
            }
        } else if (amount & 0x20) {
            this.active.splice(idx);
        } else if (amount & 0x10) {
            this.completed.push(consoleId);
        }
    }
}