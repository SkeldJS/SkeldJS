import { SystemType } from "@skeldjs/constant";
import { HazelBuffer } from "@skeldjs/util";

import { ShipStatusData, ShipStatus } from "./ShipStatus"

import { DeconSystem } from "../system/DeconSystem";
import { HudOverrideSystem } from "../system/HudOverrideSystem";
import { MedScanSystem } from "../system/MedScanSystem";
import { ReactorSystem } from "../system/ReactorSystem";
import { SabotageSystem } from "../system/SabotageSystem";
import { SwitchSystem } from "../system/SwitchSystem";
import { DoorsSystem } from "../system/DoorsSystem";
import { SecurityCameraSystem } from "../system/SecurityCameraSystem";

import { Room } from "../Room";

export class PlanetMap extends ShipStatus {
    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|ShipStatusData) {
        super(room, netid, ownerid, data);
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (!this.systems) {
            this.systems = {
                [SystemType.Electrical]: new SwitchSystem(this),
                [SystemType.MedBay]: new MedScanSystem(this),
                [SystemType.Security]: new SecurityCameraSystem(this),
                [SystemType.Communications]: new HudOverrideSystem(this),
                [SystemType.Doors]: new DoorsSystem(this),
                [SystemType.Sabotage]: new SabotageSystem(this),
                [SystemType.Decontamination]: new DeconSystem(this),
                [SystemType.Decontamination2]: new DeconSystem(this),
                [SystemType.Laboratory]: new ReactorSystem(this)
            }
        }

        this.DeserializeStep2(reader, spawn);
    }
}