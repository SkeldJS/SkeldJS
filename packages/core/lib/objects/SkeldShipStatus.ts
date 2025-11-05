import { Vector2 } from "@skeldjs/hazel";
import { GameMap, mapTasksData, SystemType } from "@skeldjs/au-constants";

import { ShipStatus } from "./ShipStatus";

import {
    LifeSuppSystem,
    MedScanSystem,
    SecurityCameraSystem,
    AutoDoorsSystem,
    SabotageSystem,
    SwitchSystem,
    ReactorSystem,
    HudOverrideSystem,
    DoorsSystem,
    AutoOpenDoor,
} from "../systems";

import { StatefulRoom } from "../StatefulRoom";

/**
 * Represents a room object for the The Skeld map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class SkeldShipStatus<RoomType extends StatefulRoom> extends ShipStatus<RoomType> {
    initialSpawnCenter = new Vector2(-0.72, 0.62);
    meetingSpawnCenter = new Vector2(-0.72, 0.62);

    async setupSystems() {
        const reactorSystem = new ReactorSystem(this, SystemType.Reactor);
        this.systems.set(SystemType.Reactor, reactorSystem);
        reactorSystem.sabotageDuration = 60;

        this.systems.set(SystemType.Electrical, new SwitchSystem(this, SystemType.Electrical));
        this.systems.set(SystemType.LifeSupp, new LifeSuppSystem(this, SystemType.LifeSupp));
        this.systems.set(SystemType.MedBay, new MedScanSystem(this, SystemType.MedBay));
        this.systems.set(SystemType.Security, new SecurityCameraSystem(this, SystemType.Security));
        this.systems.set(SystemType.Comms, new HudOverrideSystem(this, SystemType.Comms));
        
        const autoDoorsSystem = new AutoDoorsSystem(this, SystemType.Doors);
        this.systems.set(SystemType.Doors, autoDoorsSystem);
        autoDoorsSystem.doors = [
            new AutoOpenDoor(autoDoorsSystem, SystemType.Cafeteria, 0),
            new AutoOpenDoor(autoDoorsSystem, SystemType.Storage, 1),
            new AutoOpenDoor(autoDoorsSystem, SystemType.UpperEngine, 2),
            new AutoOpenDoor(autoDoorsSystem, SystemType.Cafeteria, 3),
            new AutoOpenDoor(autoDoorsSystem, SystemType.LowerEngine, 4),
            new AutoOpenDoor(autoDoorsSystem, SystemType.UpperEngine, 5),
            new AutoOpenDoor(autoDoorsSystem, SystemType.Security, 6),
            new AutoOpenDoor(autoDoorsSystem, SystemType.Storage, 7),
            new AutoOpenDoor(autoDoorsSystem, SystemType.Cafeteria, 8),
            new AutoOpenDoor(autoDoorsSystem, SystemType.Electrical, 9),
            new AutoOpenDoor(autoDoorsSystem, SystemType.MedBay, 10),
            new AutoOpenDoor(autoDoorsSystem, SystemType.LowerEngine, 11),
            new AutoOpenDoor(autoDoorsSystem, SystemType.Storage, 12),
        ];

        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage));
    }

    getTasks() {
        return mapTasksData[GameMap.TheSkeld];
    }
    
    getStartWaitSeconds(): number {
        return 10;
    }
}
