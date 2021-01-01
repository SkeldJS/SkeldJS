import { SpawnID, SystemType } from "@skeldjs/constant";
import { HazelBuffer } from "@skeldjs/util";

import { ShipStatusData, BaseShipStatus } from "./BaseShipStatus"

import { DeconSystem } from "../system/DeconSystem";
import { HudOverrideSystem } from "../system/HudOverrideSystem";
import { MedScanSystem } from "../system/MedScanSystem";
import { ReactorSystem } from "../system/ReactorSystem";
import { SabotageSystem } from "../system/SabotageSystem";
import { SwitchSystem } from "../system/SwitchSystem";
import { DoorsSystem } from "../system/DoorsSystem";
import { SecurityCameraSystem } from "../system/SecurityCameraSystem";

import { Room } from "../Room";

export class PlanetMap extends BaseShipStatus {
    static type = SpawnID.PlanetMap as const;
    type = SpawnID.PlanetMap as const;

    static classname = "PlanetMap" as const;
    classname = "PlanetMap" as const;

    systems = {
        [SystemType.Electrical]: new SwitchSystem(this, {
            expected: [false, false, false, false, false],
            actual: [false, false, false, false, false],
            brightness: 100
        }),
        [SystemType.MedBay]: new MedScanSystem(this, {
            queue: []
        }),
        [SystemType.Security]: new SecurityCameraSystem(this, {
            players: new Set
        }),
        [SystemType.Communications]: new HudOverrideSystem(this, {
            sabotaged: false
        }),
        [SystemType.Doors]: new DoorsSystem(this, {
            doors: [
                true, true, true, true,
                true, true, true, true,
                true, true, true, true
            ],
            cooldowns: new Map
        }),
        [SystemType.Sabotage]: new SabotageSystem(this, {
            cooldown: 0
        }),
        [SystemType.Decontamination]: new DeconSystem(this, {
            timer: 10000,
            state: 0
        }),
        [SystemType.Decontamination2]: new DeconSystem(this, {
            timer: 10000,
            state: 0
        }),
        [SystemType.Laboratory]: new ReactorSystem(this, {
            timer: 10000,
            completed: []
        })
    } as const;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|ShipStatusData) {
        super(room, netid, ownerid, data);
    }
}