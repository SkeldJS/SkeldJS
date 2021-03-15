import { HazelBuffer } from "@skeldjs/util";
import { SpawnID, SystemType } from "@skeldjs/constant";

import { ShipStatusData, BaseShipStatus } from "./BaseShipStatus";

import { Hostable } from "../Hostable";
import {
    DoorsSystem,
    HudOverrideSystem,
    ReactorSystem,
    SabotageSystem,
    SecurityCameraSystem,
    SwitchSystem,
} from "../system";

/**
 * Represents a room object for the Airship map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class Airship extends BaseShipStatus {
    static type = SpawnID.Airship as const;
    type = SpawnID.Airship as const;

    static classname = "Airship" as const;
    classname = "Airship" as const;

    systems: {
        [SystemType.Reactor]: ReactorSystem;
        [SystemType.Electrical]: SwitchSystem;
        [SystemType.Security]: SecurityCameraSystem;
        [SystemType.Communications]: HudOverrideSystem;
        [SystemType.Doors]: DoorsSystem;
        [SystemType.Sabotage]: SabotageSystem;
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
            [SystemType.Reactor]: new ReactorSystem(this, {
                timer: 10000,
                completed: new Set(),
            }),
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
            [SystemType.Doors]: new DoorsSystem(this, {
                cooldowns: new Map(),
                doors: [
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                ],
            }),
            [SystemType.Sabotage]: new SabotageSystem(this, {
                cooldown: 0,
            }),
        };
    }
}
