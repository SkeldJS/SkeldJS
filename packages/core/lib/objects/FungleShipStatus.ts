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
    Door,
    SabotageSystem,
} from "../systems";

/**
 * Represents a room object for the Airship map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class FungleShipStatus<RoomType extends StatefulRoom> extends InnerShipStatus<RoomType> {
    async setupSystems() {
        this.systems.set(SystemType.Ventilation, new VentilationSystem(this, SystemType.Ventilation));

        this.systems.set(SystemType.Communications, new HqHudSystem(this, SystemType.Communications));

        const reactorSystem = new ReactorSystem(this, SystemType.Reactor);
        this.systems.set(SystemType.Reactor, reactorSystem);
        reactorSystem.sabotageDuration = 60;

        const doorsSystem = new DoorsSystem(this, SystemType.Doors);
        this.systems.set(SystemType.Doors, doorsSystem);
        doorsSystem.doors = [
            new Door(doorsSystem, SystemType.Communications, 0),
            new Door(doorsSystem, SystemType.Communications, 1),
            new Door(doorsSystem, SystemType.Kitchen, 2),
            new Door(doorsSystem, SystemType.Laboratory, 3),
            new Door(doorsSystem, SystemType.Lookout, 4),
            new Door(doorsSystem, SystemType.MiningPit, 5),
            new Door(doorsSystem, SystemType.Reactor, 6),
            new Door(doorsSystem, SystemType.Storage, 7),
        ];
        
        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage));

        const mushroomMixupSabotageSystem = new MushroomMixupSabotageSystem(this, SystemType.MushroomMixupSabotage);
        this.systems.set(SystemType.MushroomMixupSabotage, mushroomMixupSabotageSystem);
        
        const availableSkinIdsSet: Set<string> = new Set();
        for (const [ , playerInfo ] of this.room.playerInfo) {
            availableSkinIdsSet.add(playerInfo.defaultOutfit.skinId);
        }

        mushroomMixupSabotageSystem.availableSkinIds = [...availableSkinIdsSet];
    }

    getTasks() {
        return Object.values(TheFungleTasks);
    }
    
    getStartWaitSeconds(): number {
        return 15;
    }
}
