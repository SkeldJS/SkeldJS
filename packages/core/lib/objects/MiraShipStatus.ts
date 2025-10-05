import { Vector2 } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { MiraHQTasks } from "@skeldjs/data";

import {
    DeconSystem,
    HqHudSystem,
    LifeSuppSystem,
    MedScanSystem,
    ReactorSystem,
    SabotageSystem,
    SwitchSystem,
} from "../systems";

import { InnerShipStatus } from "./InnerShipStatus";
import { StatefulRoom } from "../StatefulRoom";

/**
 * Represents a room object for the Mira HQ map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class MiraShipStatus<RoomType extends StatefulRoom> extends InnerShipStatus<RoomType> {
    initialSpawnCenter = new Vector2(-4.4, 2.2);
    meetingSpawnCenter = new Vector2(24.043, 1.72);

    get owner() {
        return super.owner as RoomType;
    }
    
    async processAwake(): Promise<void> {
        void 0;
    }

    setupSystems() {
        this.systems.set(SystemType.Reactor, new ReactorSystem(this, SystemType.Reactor, 60));
        this.systems.set(SystemType.Electrical, new SwitchSystem(this, SystemType.Electrical));
        this.systems.set(SystemType.O2, new LifeSuppSystem(this, SystemType.O2));
        this.systems.set(SystemType.MedBay, new MedScanSystem(this, SystemType.MedBay));
        
        const hqHudSystem = new HqHudSystem(this, SystemType.Communications);
        this.systems.set(SystemType.Communications, hqHudSystem);
        hqHudSystem.completedConsoles = new Set([0, 1]);

        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage));
        this.systems.set(SystemType.Decontamination, new DeconSystem(this, SystemType.Decontamination));
    }

    getDoorsInRoom(room: SystemType) {
        return [];
    }

    getTasks() {
        return Object.values(MiraHQTasks);
    }
}
