import { HazelBuffer } from "@skeldjs/util";

import { SpawnID, SystemType } from "@skeldjs/constant";

import { BaseShipStatus, ShipStatusData } from "./BaseShipStatus"

import { DeconSystem } from "../system/DeconSystem";
import { LifeSuppSystem } from "../system/LifeSuppSystem";
import { MedScanSystem } from "../system/MedScanSystem";
import { ReactorSystem } from "../system/ReactorSystem";
import { SabotageSystem } from "../system/SabotageSystem";
import { SwitchSystem } from "../system/SwitchSystem";

import { Room } from "../Room";
import { HqHudSystem } from "../system";

export class Headquarters extends BaseShipStatus {
    static type = SpawnID.Headquarters as const;
    type = SpawnID.Headquarters as const;

    static classname = "Headquarters" as const;
    classname = "Headquarters" as const;

    systems: {
        [SystemType.Reactor]: ReactorSystem;
        [SystemType.Electrical]: SwitchSystem;
        [SystemType.O2]: LifeSuppSystem;
        [SystemType.MedBay]: MedScanSystem;
        [SystemType.Communications]: HqHudSystem;
        [SystemType.Sabotage]: SabotageSystem;
        [SystemType.Decontamination]: DeconSystem;
    };

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|ShipStatusData) {
        super(room, netid, ownerid, data);
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            this.systems ||= {
                [SystemType.Reactor]: new ReactorSystem(this, {
                    timer: 10000,
                    completed: []
                }),
                [SystemType.Electrical]: new SwitchSystem(this, {
                    expected: [false, false, false, false, false],
                    actual: [false, false, false, false, false],
                    brightness: 100
                }),
                [SystemType.O2]: new LifeSuppSystem(this, {
                    timer: 10000,
                    completed: []
                }),
                [SystemType.MedBay]: new MedScanSystem(this, {
                    queue: []
                }),
                [SystemType.Communications]: new HqHudSystem(this, {
                    active: [],
                    completed: []
                }),
                [SystemType.Sabotage]: new SabotageSystem(this, {
                    cooldown: 0
                }),
                [SystemType.Decontamination]: new DeconSystem(this, {
                    timer: 10000,
                    state: 0
                })
            }
        }

        super.Deserialize(reader, spawn);
    }
}