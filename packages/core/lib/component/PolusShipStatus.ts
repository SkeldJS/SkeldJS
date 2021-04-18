import { SpawnID, SystemType } from "@skeldjs/constant";
import { HazelBuffer } from "@skeldjs/util";

import { ShipStatusData, InnerShipStatus } from "./InnerShipStatus";

import { Hostable } from "../Hostable";

import {
    DeconSystem,
    HudOverrideSystem,
    MedScanSystem,
    ReactorSystem,
    SabotageSystem,
    SwitchSystem,
    DoorsSystem,
    SecurityCameraSystem,
} from "../system";
import { Door } from "../misc/Door";

/**
 * Represents a room object for the Polus map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class PolusShipStatus extends InnerShipStatus {
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

    constructor(
        room: Hostable,
        netid: number,
        ownerid: number,
        data?: HazelBuffer | ShipStatusData
    ) {
        super(room, netid, ownerid, data);
    }

    Setup() {
        this.systems = {
            [SystemType.Electrical]: new SwitchSystem(this, {
                expected: [false, false, false, false, false],
                actual: [false, false, false, false, false],
                brightness: 100,
            }),
            [SystemType.MedBay]: new MedScanSystem(this, {
                queue: [],
            }),
            [SystemType.Security]: new SecurityCameraSystem(this, {
                players: new Set(),
            }),
            [SystemType.Communications]: new HudOverrideSystem(this, {
                sabotaged: false,
            }),
            [SystemType.Doors]: new DoorsSystem(this, {
                doors: [],
                cooldowns: new Map(),
            }),
            [SystemType.Sabotage]: new SabotageSystem(this, {
                cooldown: 0,
            }),
            [SystemType.Decontamination]: new DeconSystem(this, {
                timer: 10000,
                state: 0,
            }),
            [SystemType.Decontamination2]: new DeconSystem(this, {
                timer: 10000,
                state: 0,
            }),
            [SystemType.Laboratory]: new ReactorSystem(this, {
                timer: 10000,
                completed: new Set(),
            }),
        };

        const doorsystem = this.systems[SystemType.Doors];
        doorsystem.doors = [
            new Door(doorsystem, 0, true),
            new Door(doorsystem, 1, true),
            new Door(doorsystem, 2, true),
            new Door(doorsystem, 3, true),
            new Door(doorsystem, 4, true),
            new Door(doorsystem, 5, true),
            new Door(doorsystem, 6, true),
            new Door(doorsystem, 7, true),
            new Door(doorsystem, 8, true),
            new Door(doorsystem, 9, true),
            new Door(doorsystem, 10, true),
            new Door(doorsystem, 11, true),
        ];
    }
}
