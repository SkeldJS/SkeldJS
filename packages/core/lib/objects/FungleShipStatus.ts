import { HazelReader } from "@skeldjs/util";
import { SpawnType, SystemType } from "@skeldjs/constant";
import { AirshipTasks } from "@skeldjs/data";

import { ShipStatusData, InnerShipStatus } from "./InnerShipStatus";

import { StatefulRoom } from "../StatefulRoom";

import {
    DoorsSystem,
    VentilationSystem,
    HqHudSystem,
    ReactorSystem,
    MushroomMixupSabotageSystem,
} from "../systems";

/**
 * Represents a room object for the Airship map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class FungleShipStatus<RoomType extends StatefulRoom = StatefulRoom> extends InnerShipStatus<RoomType> {
    static roomDoors: Partial<Record<SystemType, number[]>> = {
        [SystemType.Communications]: [0, 1, 2, 3],
        [SystemType.Brig]: [4, 5, 6],
        [SystemType.Kitchen]: [7, 8, 9],
        [SystemType.MainHall]: [10, 11],
        [SystemType.Records]: [12, 13, 14],
        [SystemType.Lounge]: [15, 16, 17, 18],
        [SystemType.Medical]: [19, 20]
    };

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
        data?: HazelReader | ShipStatusData
    ) {
        super(room, spawnType, netId, ownerId, flags, data);
    }

    Setup() {
        this.systems.set(SystemType.Ventilation, new VentilationSystem(this, SystemType.Ventilation, {}));

        this.systems.set(SystemType.Communications, new HqHudSystem(this, SystemType.Communications, {
            timer: 10000,
            activeConsoles: [],
            completedConsoles: new Set([0, 1]),
        }));

        this.systems.set(SystemType.Reactor, new ReactorSystem(this, SystemType.Reactor, {
            timer: 10000,
            completed: new Set([ 0, 1 ]),
        }, 60));

        this.systems.set(SystemType.Doors, new DoorsSystem(this, SystemType.Doors, {
            doors: [],
            cooldowns: new Map,
        }));

        this.systems.set(SystemType.MushroomMixupSabotage, new MushroomMixupSabotageSystem(this, SystemType.MushroomMixupSabotage, {}));
    }

    getDoorsInRoom(room: SystemType) {
        return FungleShipStatus.roomDoors[room] || [];
    }

    getTasks() {
        return Object.values(AirshipTasks);
    }
}
