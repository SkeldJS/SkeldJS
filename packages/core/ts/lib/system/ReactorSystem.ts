import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

export interface ReactorSystemData {
    timer: number;
    completed: number[];
}

export type ReactorSystemEvents = {

}

export class ReactorSystem extends SystemStatus<ReactorSystemEvents> {
    static systemType = SystemType.Reactor as const;
    systemType = SystemType.Reactor as const;
    
    timer: number;
    completed: number[];

    constructor(ship: BaseShipStatus, data?: HazelBuffer|ReactorSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        this.timer = reader.float();

        const num_consoles = reader.upacked();
        this.completed = [];
        for (let i = 0; i < num_consoles; i++) {
            this.completed.push(reader.upacked());
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.float(this.timer);

        for (let i = 0; i < this.completed.length; i++) {
            writer.upacked(this.completed[i]);
        }
    }
    
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    HandleRepair(control: PlayerData, amount: number) {
        // todo: https://github.com/codyphobe/among-us-protocol/blob/master/04_rpc_message_types/28_repairsystem.md#reactor-and-laboratory
    }
}