import { HazelBuffer } from "@skeldjs/util";
import { SpawnID, SystemType } from "@skeldjs/constant";

import { ShipStatusData, InnerShipStatus } from "./InnerShipStatus";

import { Hostable } from "../Hostable";
import {
    AutoDoorsSystem,
    DoorsSystem,
    HudOverrideSystem,
    ReactorSystem,
    SabotageSystem,
    SecurityCameraSystem,
    SwitchSystem,
} from "../system";
import { ElectricalDoorsSystem } from "../system/ElectricalDoorsSystem";
import { MovingPlatformSide, MovingPlatformSystem } from "../system/MovingPlatformSystem";

/**
 * Represents a room object for the Airship map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class AirshipStatus extends InnerShipStatus {
    static type = SpawnID.Airship as const;
    type = SpawnID.Airship as const;

    static classname = "Airship" as const;
    classname = "Airship" as const;

    systems: {
        [SystemType.Electrical]: SwitchSystem;
        [SystemType.Security]: SecurityCameraSystem;
        [SystemType.Communications]: HudOverrideSystem;
        [SystemType.Sabotage]: SabotageSystem;
        [SystemType.GapRoom]: MovingPlatformSystem;
        [SystemType.Decontamination]: ElectricalDoorsSystem;
        [SystemType.Decontamination2]: AutoDoorsSystem
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
            [SystemType.Security]: new SecurityCameraSystem(this, {
                players: new Set(),
            }),
            [SystemType.Communications]: new HudOverrideSystem(this, {
                sabotaged: false,
            }),
            [SystemType.Decontamination]: new ElectricalDoorsSystem(this, {
                cooldowns: new Map,
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
                target: null,
                side: MovingPlatformSide.Left,
                useId: 0,
            }),
        };
    }
}
