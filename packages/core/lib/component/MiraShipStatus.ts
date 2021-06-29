import { HazelReader } from "@skeldjs/util";
import { SpawnType, SystemType } from "@skeldjs/constant";

import { InnerShipStatus, ShipStatusData } from "./InnerShipStatus";
import { Hostable } from "../Hostable";

import {
    DeconSystem,
    HqHudSystem,
    LifeSuppSystem,
    MedScanSystem,
    ReactorSystem,
    SabotageSystem,
    SwitchSystem,
} from "../system";

/**
 * Represents a room object for the Mira HQ map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class MiraShipStatus<RoomType extends Hostable = Hostable> extends InnerShipStatus<RoomType> {
    static type = SpawnType.Headquarters as const;
    type = SpawnType.Headquarters as const;

    static classname = "Headquarters" as const;
    classname = "Headquarters" as const;

    systems!: {
        [SystemType.Reactor]: ReactorSystem<RoomType>;
        [SystemType.Electrical]: SwitchSystem<RoomType>;
        [SystemType.O2]: LifeSuppSystem<RoomType>;
        [SystemType.MedBay]: MedScanSystem<RoomType>;
        [SystemType.Communications]: HqHudSystem<RoomType>;
        [SystemType.Sabotage]: SabotageSystem<RoomType>;
        [SystemType.Decontamination]: DeconSystem<RoomType>;
    };

    constructor(
        room: RoomType,
        netid: number,
        ownerid: number,
        data?: HazelReader | ShipStatusData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as RoomType;
    }

    Setup() {
        this.systems = {
            [SystemType.Reactor]: new ReactorSystem(this, {
                timer: 10000,
                completed: new Set,
            }),
            [SystemType.Electrical]: new SwitchSystem(this, {
                expected: [false, false, false, false, false],
                actual: [false, false, false, false, false],
                brightness: 100,
            }),
            [SystemType.O2]: new LifeSuppSystem(this, {
                timer: 10000,
                completed: new Set,
            }),
            [SystemType.MedBay]: new MedScanSystem(this, {
                queue: [],
            }),
            [SystemType.Communications]: new HqHudSystem(this, {
                active: [],
                completed: new Set([0, 1]),
            }),
            [SystemType.Sabotage]: new SabotageSystem(this, {
                cooldown: 0,
            }),
            [SystemType.Decontamination]: new DeconSystem(this, {
                timer: 10000,
                state: 0,
            }),
        };
    }
}
