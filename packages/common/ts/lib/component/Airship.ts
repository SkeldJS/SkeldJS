import { HazelBuffer } from "@skeldjs/util";

import { ShipStatusData, BaseShipStatus } from "./BaseShipStatus"

import { Room } from "../Room";
import { SpawnID } from "@skeldjs/constant";

export class Airship extends BaseShipStatus {
    static type = SpawnID.Airship as const;
    type = SpawnID.Airship as const;


    systems = {} as const;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|ShipStatusData) {
        super(room, netid, ownerid, data);
    }
}