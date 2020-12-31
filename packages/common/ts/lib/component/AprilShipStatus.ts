import { HazelBuffer } from "@skeldjs/util";

import {
    SpawnID,
    SystemType
} from "@skeldjs/constant";

import { ShipStatusData, BaseShipStatus } from "./BaseShipStatus";

import {
    HudOverrideSystem,
    LifeSuppSystem,
    MedScanSystem,
    SecurityCameraSystem,
    AutoDoorsSystem,
    SabotageSystem,
    SwitchSystem,
    ReactorSystem
} from "../system"

import { Room } from "../Room";

export class AprilShipStatus extends BaseShipStatus {
    static type = SpawnID.AprilShipStatus as const;
    type = SpawnID.AprilShipStatus as const;

    static classname = "AprilShipStatus" as const;
    classname = "AprilShipStatus" as const;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|ShipStatusData) {
        super(room, netid, ownerid, data);
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (!this.systems) {
            this.systems = {
                [SystemType.Reactor]: new ReactorSystem(this),
                [SystemType.Electrical]: new SwitchSystem(this),
                [SystemType.O2]: new LifeSuppSystem(this),
                [SystemType.MedBay]: new MedScanSystem(this),
                [SystemType.Security]: new SecurityCameraSystem(this),
                [SystemType.Communications]: new HudOverrideSystem(this),
                [SystemType.Doors]: new AutoDoorsSystem(this),
                [SystemType.Sabotage]: new SabotageSystem(this)
            }
        }

        super.Deserialize(reader, spawn);
    }

    /* eslint-disable-next-line */
    Serialize(writer: HazelBuffer, spawn: boolean = false) {

    }
}