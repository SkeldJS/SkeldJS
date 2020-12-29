import { HazelBuffer } from "@skeldjs/util";

import {
    SpawnID,
    SystemType
} from "@skeldjs/constant";

import { DeconSystem } from "../system/DeconSystem";
import { HudOverrideSystem } from "../system/HudOverrideSystem";
import { LifeSuppSystem } from "../system/LifeSuppSystem";
import { MedScanSystem } from "../system/MedScanSystem";
import { SecurityCameraSystem } from "../system/SecurityCameraSystem";
import { HqHudSystem } from "../system/HqHudSystem";
import { AutoDoorsSystem } from "../system/AutoDoorsSystem";
import { DoorsSystem } from "../system/DoorsSystem";
import { SabotageSystem } from "../system/SabotageSystem";
import { SwitchSystem } from "../system/SwitchSystem";
import { ReactorSystem } from "../system/ReactorSystem";

import { SystemStatus } from "../system/SystemStatus";

import { Networkable } from "../Networkable";
import { Global } from "../Global";
import { Room } from "../Room";

type AllSystems = Partial<{
    [SystemType.Reactor]: ReactorSystem,
    [SystemType.Electrical]: SwitchSystem,
    [SystemType.O2]: LifeSuppSystem,
    [SystemType.MedBay]: MedScanSystem,
    [SystemType.Security]: SecurityCameraSystem,
    [SystemType.Communications]: HudOverrideSystem|HqHudSystem,
    [SystemType.Doors]: AutoDoorsSystem|DoorsSystem,
    [SystemType.Sabotage]: SabotageSystem,
    [SystemType.Decontamination]: DeconSystem,
    [SystemType.Decontamination2]: DeconSystem,
    [SystemType.Laboratory]: ReactorSystem
}>;

export interface ShipStatusData {
    systems: AllSystems;
}

export class ShipStatus extends Networkable<Global> {
    static type = SpawnID.ShipStatus;
    type = SpawnID.ShipStatus;

    static classname = "ShipStatus";
    classname = "ShipStatus";
    
    systems: AllSystems;

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

        this.DeserializeStep2(reader, spawn); // Step 2 so the HeadQuarters, PolusMap and AprilShipStatus that extend from ShipStatus can put their own systems in onspawn beforehand.
    }

    DeserializeStep2(reader: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            for (let i = 0; i < 32; i++) {
                const system = this.systems[i] as SystemStatus;

                if (system) {
                    system.Deserialize(reader, spawn);
                }
            }
        } else {
            const mask = reader.upacked();

            for (let i = 0; i < 32; i++) {
                const system = this.systems[i] as SystemStatus;

                if (system && (mask & (1 << i))) {
                    system.Deserialize(reader, spawn);
                }
            }
        }
    }

    /* eslint-disable-next-line */
    Serialize(writer: HazelBuffer, spawn: boolean = false) {

    }
}