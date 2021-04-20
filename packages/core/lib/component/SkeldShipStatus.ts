import { HazelReader } from "@skeldjs/util";
import { SpawnType, SystemType } from "@skeldjs/constant";

import { ShipStatusData, InnerShipStatus } from "./InnerShipStatus";

import {
    HudOverrideSystem,
    LifeSuppSystem,
    MedScanSystem,
    SecurityCameraSystem,
    AutoDoorsSystem,
    SabotageSystem,
    SwitchSystem,
    ReactorSystem,
} from "../system";

import { Hostable } from "../Hostable";
import { AutoOpenDoor } from "../misc/AutoOpenDoor";

/**
 * Represents a room object for the The Skeld map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class SkeldShipStatus extends InnerShipStatus {
    static type = SpawnType.ShipStatus as const;
    type = SpawnType.ShipStatus as const;

    static classname = "ShipStatus" as const;
    classname = "ShipStatus" as const;

    systems: {
        [SystemType.Reactor]: ReactorSystem;
        [SystemType.Electrical]: SwitchSystem;
        [SystemType.O2]: LifeSuppSystem;
        [SystemType.MedBay]: MedScanSystem;
        [SystemType.Security]: SecurityCameraSystem;
        [SystemType.Communications]: HudOverrideSystem;
        [SystemType.Doors]: AutoDoorsSystem;
        [SystemType.Sabotage]: SabotageSystem;
    };

    constructor(
        room: Hostable<any>,
        netid: number,
        ownerid: number,
        data?: HazelReader | ShipStatusData
    ) {
        super(room, netid, ownerid, data);
    }

    Setup() {
        this.systems = {
            [SystemType.Reactor]: new ReactorSystem(this, {
                timer: 10000,
                completed: new Set(),
            }),
            [SystemType.Electrical]: new SwitchSystem(this, {
                expected: [false, false, false, false, false],
                actual: [false, false, false, false, false],
                brightness: 255,
            }),
            [SystemType.O2]: new LifeSuppSystem(this, {
                timer: 10000,
                completed: new Set(),
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
            [SystemType.Doors]: new AutoDoorsSystem(this, {
                dirtyBit: 0,
                doors: [],
            }),
            [SystemType.Sabotage]: new SabotageSystem(this, {
                cooldown: 0,
            }),
        };

        const autodoorsystem = this.systems[SystemType.Doors];
        autodoorsystem.doors = [
            new AutoOpenDoor(autodoorsystem, 0, true),
            new AutoOpenDoor(autodoorsystem, 1, true),
            new AutoOpenDoor(autodoorsystem, 2, true),
            new AutoOpenDoor(autodoorsystem, 3, true),
            new AutoOpenDoor(autodoorsystem, 4, true),
            new AutoOpenDoor(autodoorsystem, 5, true),
            new AutoOpenDoor(autodoorsystem, 6, true),
            new AutoOpenDoor(autodoorsystem, 7, true),
            new AutoOpenDoor(autodoorsystem, 8, true),
            new AutoOpenDoor(autodoorsystem, 9, true),
            new AutoOpenDoor(autodoorsystem, 10, true),
            new AutoOpenDoor(autodoorsystem, 11, true),
            new AutoOpenDoor(autodoorsystem, 12, true),
            new AutoOpenDoor(autodoorsystem, 13, true),
        ];
    }
}
