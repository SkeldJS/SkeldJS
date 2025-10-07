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

    setupSystems() {
        this.systems.set(SystemType.Ventilation, new VentilationSystem(this, SystemType.Ventilation));

        const hqHudSystem = new HqHudSystem(this, SystemType.Communications);
        this.systems.set(SystemType.Communications, hqHudSystem);
        hqHudSystem.completedConsoles = new Set([0, 1]);

        const reactorSystem = new ReactorSystem(this, SystemType.Reactor, 60);
        this.systems.set(SystemType.Reactor, reactorSystem);
        reactorSystem.completed = new Set([0, 1]);

        const doorsSystem = new DoorsSystem(this, SystemType.Doors);
        this.systems.set(SystemType.Doors, doorsSystem);
        // todo: register fungle doors

        this.systems.set(SystemType.MushroomMixupSabotage, new MushroomMixupSabotageSystem(this, SystemType.MushroomMixupSabotage));
    }
    
    async processAwake(): Promise<void> {
        void 0;
    }

    getDoorsInRoom(room: SystemType) {
        return FungleShipStatus.roomDoors[room] || [];
    }

    getTasks() {
        return Object.values(TheFungleTasks);
    }
}
