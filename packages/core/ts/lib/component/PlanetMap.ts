import { SpawnID, SystemType } from "@skeldjs/constant";
import { HazelBuffer } from "@skeldjs/util";

import { ShipStatusData, BaseShipStatus } from "./BaseShipStatus"

import { Hostable } from "../Hostable";

import {
    DeconSystem,
    HudOverrideSystem,
    MedScanSystem,
    ReactorSystem,
    SabotageSystem,
    SwitchSystem,
    DoorsSystem,
    SecurityCameraSystem
} from "../system"

export class PlanetMap extends BaseShipStatus {
    static type = SpawnID.PlanetMap as const;
    type = SpawnID.PlanetMap as const;

    static classname = "PlanetMap" as const;
    classname = "PlanetMap" as const;

    systems: {
        [SystemType.Electrical]: SwitchSystem;
        [SystemType.MedBay]: MedScanSystem;
        [SystemType.Security]: SecurityCameraSystem;
        [SystemType.Communications]: HudOverrideSystem;
        [SystemType.Doors]: DoorsSystem;
        [SystemType.Sabotage]: SabotageSystem;
        [SystemType.Decontamination]: DeconSystem;
        [SystemType.Decontamination2]: DeconSystem;
        [SystemType.Laboratory]: ReactorSystem;
    };

    constructor(room: Hostable, netid: number, ownerid: number, data?: HazelBuffer|ShipStatusData) {
        super(room, netid, ownerid, data);
    }

    Setup() {
        this.systems = {
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
                completed: new Set
            })
        }
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            this.Setup();
        }

        super.Deserialize(reader, spawn);
    }

    Serialize(writer: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            this.Setup();
        }

        return super.Serialize(writer, spawn);
    }
}
