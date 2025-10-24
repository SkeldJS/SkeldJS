import { SpawnType, SystemType } from "@skeldjs/constant";
import { AirshipTasks, TheFungleTasks } from "@skeldjs/data";

import { InnerShipStatus } from "./InnerShipStatus";

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
export class FungleShipStatus<RoomType extends StatefulRoom> extends InnerShipStatus<RoomType> {
    static roomDoors: Partial<Record<SystemType, number[]>> = {
        [SystemType.Communications]: [0, 1, 2, 3],
        [SystemType.Brig]: [4, 5, 6],
        [SystemType.Kitchen]: [7, 8, 9],
        [SystemType.MainHall]: [10, 11],
        [SystemType.Records]: [12, 13, 14],
        [SystemType.Lounge]: [15, 16, 17, 18],
        [SystemType.Medical]: [19, 20]
    };

    async setupSystems() {
        this.systems.set(SystemType.Ventilation, new VentilationSystem(this, SystemType.Ventilation));

        this.systems.set(SystemType.Communications, new HqHudSystem(this, SystemType.Communications));

        const reactorSystem = new ReactorSystem(this, SystemType.Reactor);
        this.systems.set(SystemType.Reactor, reactorSystem);
        reactorSystem.sabotageDuration = 60;

        const doorsSystem = new DoorsSystem(this, SystemType.Doors);
        this.systems.set(SystemType.Doors, doorsSystem);
        // todo: register fungle doors

        this.systems.set(SystemType.MushroomMixupSabotage, new MushroomMixupSabotageSystem(this, SystemType.MushroomMixupSabotage));
    }

    getTasks() {
        return Object.values(TheFungleTasks);
    }
    
    getStartWaitSeconds(): number {
        return 15;
    }
}
