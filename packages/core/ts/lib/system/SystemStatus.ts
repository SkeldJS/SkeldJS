import { HazelBuffer, TypedEmitter, TypedEvents } from "@skeldjs/util"
import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { PlayerData } from "../PlayerData";

import { SystemStatusEvents } from "./events";

// eslint-disable-next-line @typescript-eslint/ban-types
export class SystemStatus<T extends TypedEvents = {}> extends TypedEmitter<T & SystemStatusEvents> {
    static systemType: SystemType;
    systemType: SystemType;

    constructor(protected ship: BaseShipStatus, data?: HazelBuffer|any) {
        super();

        if (data) {
            if ((data as HazelBuffer).buffer) {
                this.Deserialize(data, true);
            } else {
                Object.assign(this, data);
            }
        }
    }

    emit(event: string, ...args: any[]): boolean {
        this.ship.emit(event, this, ...args);

        return super.emit(event, ...args);
    }

    /* eslint-disable-next-line */
    Deserialize(reader: HazelBuffer, spawn: boolean) {}

    /* eslint-disable-next-line */
    Serialize(writer: HazelBuffer, spawn: boolean) {}

    /* eslint-disable-next-line */
    HandleRepair(control: PlayerData, amount: number) {}

    /* eslint-disable-next-line */
    sabotage(control: PlayerData) {}
}
