import { HazelBuffer } from "@skeldjs/util";

import { SpawnID, SystemType } from "@skeldjs/constant";

import { BaseShipStatus, ShipStatusData } from "./BaseShipStatus"

import { Hostable } from "../Hostable";

import {
    DeconSystem,
    HqHudSystem,
    LifeSuppSystem,
    MedScanSystem,
    ReactorSystem,
    SabotageSystem,
    SwitchSystem
} from "../system";

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

    constructor(room: Hostable, netid: number, ownerid: number, data?: HazelBuffer|ShipStatusData) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as Hostable;
    }

    Setup() {
        this.systems = {
            [SystemType.Reactor]: new ReactorSystem(this, {
                timer: 10000,
                completed: new Set
            }),
            [SystemType.Electrical]: new SwitchSystem(this, {
                expected: [false, false, false, false, false],
                actual: [false, false, false, false, false],
                brightness: 100
            }),
            [SystemType.O2]: new LifeSuppSystem(this, {
                timer: 10000,
                completed: new Set
            }),
            [SystemType.MedBay]: new MedScanSystem(this, {
                queue: []
            }),
            [SystemType.Communications]: new HqHudSystem(this, {
                active: [],
                completed: new Set([0, 1])
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
}
