import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";

export class SystemStatus {
    static systemType: SystemType;
    systemType: SystemType;

    constructor(private ship: BaseShipStatus, data?: HazelBuffer|any) {
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