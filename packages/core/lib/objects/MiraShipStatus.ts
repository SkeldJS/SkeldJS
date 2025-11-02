import { Vector2 } from "@skeldjs/hazel";
import { GameMap, mapTasksData, SystemType } from "@skeldjs/au-constants";

import {
    DeconSystem,
    HqHudSystem,
    LifeSuppSystem,
    MedScanSystem,
    ReactorSystem,
    SabotageSystem,
    SwitchSystem,
} from "../systems";

import { ShipStatus } from "./ShipStatus";
import { StatefulRoom } from "../StatefulRoom";

/**
 * Represents a room object for the Mira HQ map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class MiraShipStatus<RoomType extends StatefulRoom> extends ShipStatus<RoomType> {
    initialSpawnCenter = new Vector2(-4.4, 2.2);
    meetingSpawnCenter = new Vector2(24.043, 1.72);

    get owner() {
        return super.owner as RoomType;
    }

    async setupSystems() {
        const reactorSystem = new ReactorSystem(this, SystemType.Reactor);
        this.systems.set(SystemType.Reactor, reactorSystem);
        reactorSystem.sabotageDuration = 60;

        this.systems.set(SystemType.Electrical, new SwitchSystem(this, SystemType.Electrical));
        this.systems.set(SystemType.LifeSupp, new LifeSuppSystem(this, SystemType.LifeSupp));
        this.systems.set(SystemType.MedBay, new MedScanSystem(this, SystemType.MedBay));
        
        const hqHudSystem = new HqHudSystem(this, SystemType.Comms);
        this.systems.set(SystemType.Comms, hqHudSystem);
        hqHudSystem.completedConsoles = new Set([0, 1]);

        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage));
        this.systems.set(SystemType.Decontamination, new DeconSystem(this, SystemType.Decontamination));
    }

    getTasks() {
        return mapTasksData[GameMap.MiraHQ];
    }
    
    getStartWaitSeconds(): number {
        return 10;
    }
}
