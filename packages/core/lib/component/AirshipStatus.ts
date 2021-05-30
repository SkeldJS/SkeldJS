import { HazelReader } from "@skeldjs/util";
import { SpawnType, SystemType } from "@skeldjs/constant";

import { ShipStatusData, InnerShipStatus } from "./InnerShipStatus";

import { Hostable } from "../Hostable";

import {
    AutoDoorsSystem,
    HudOverrideSystem,
    SabotageSystem,
    SecurityCameraSystem,
    SwitchSystem,
    ElectricalDoorsSystem,
    MovingPlatformSide,
    MovingPlatformSystem,
} from "../system";

/**
 * Represents a room object for the Airship map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class AirshipStatus extends InnerShipStatus {
    static type = SpawnType.Airship as const;
    type = SpawnType.Airship as const;

    static classname = "Airship" as const;
    classname = "Airship" as const;

    static roomDoors = {
        [SystemType.Communications]: [0, 1, 2, 3],
        [SystemType.Brig]: [4, 5, 6],
        [SystemType.Kitchen]: [7, 8, 9],
        [SystemType.MainHall]: [10, 11],
        [SystemType.Records]: [12, 13, 14],
        [SystemType.Lounge]: [15, 16, 17],
        [SystemType.Medical]: [19, 20]
    }

    systems!: {
        [SystemType.Electrical]: SwitchSystem;
        [SystemType.Security]: SecurityCameraSystem;
        [SystemType.Communications]: HudOverrideSystem;
        [SystemType.Sabotage]: SabotageSystem;
        [SystemType.GapRoom]: MovingPlatformSystem;
        [SystemType.Decontamination]: ElectricalDoorsSystem;
        [SystemType.Decontamination2]: AutoDoorsSystem;
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
            [SystemType.Electrical]: new SwitchSystem(this, {
                expected: [false, false, false, false, false],
                actual: [false, false, false, false, false],
                brightness: 100,
            }),
            [SystemType.Security]: new SecurityCameraSystem(this, {
                players: new Set(),
            }),
            [SystemType.Communications]: new HudOverrideSystem(this, {
                sabotaged: false,
            }),
            [SystemType.Decontamination]: new ElectricalDoorsSystem(this, {
                doors: [],
            }),
            [SystemType.Decontamination2]: new AutoDoorsSystem(this, {
                dirtyBit: 0,
                doors: [],
            }),
            [SystemType.Sabotage]: new SabotageSystem(this, {
                cooldown: 0,
            }),
            [SystemType.GapRoom]: new MovingPlatformSystem(this, {
                target: undefined,
                side: MovingPlatformSide.Left,
                useId: 0,
            }),
        };
    }
}
