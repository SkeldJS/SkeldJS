import { HazelBuffer } from "@skeldjs/util";

import { ShipStatusData, ShipStatus } from "./ShipStatus"
import { Room } from "../Room";
import { SpawnID } from "@skeldjs/constant";

export class AprilShipStatus extends ShipStatus {
    static type = SpawnID.AprilShipStatus;
    type = SpawnID.AprilShipStatus;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|ShipStatusData) {
        super(room, netid, ownerid, data);
    }
}