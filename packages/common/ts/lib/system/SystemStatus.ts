import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { ShipStatus } from "../component/ShipStatus";

export class SystemStatus {
    static systemType: SystemType;
    systemType: SystemType;

    ship: ShipStatus;

    constructor(ship: ShipStatus, data?: HazelBuffer|any) {
        this.ship = ship;

        if (data) {
            if ((data as HazelBuffer).buffer) {
                this.Deserialize(data, true);
            } else {
                Object.assign(this, data);
            }
        }
    }

    /* eslint-disable-next-line */
    Deserialize(reader: HazelBuffer, spawn: boolean) {}
    
    /* eslint-disable-next-line */
    Serialize(writer: HazelBuffer, spawn: boolean) {}
}