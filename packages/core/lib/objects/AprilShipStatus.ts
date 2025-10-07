import { Vector2 } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { AprilFoolsTheSkeldTasks, TheSkeldTasks } from "@skeldjs/data";

import { InnerShipStatus } from "./InnerShipStatus";

import {
    LifeSuppSystem,
    MedScanSystem,
    SecurityCameraSystem,
    AutoDoorsSystem,
    SabotageSystem,
    SwitchSystem,
    ReactorSystem,
    HudOverrideSystem
} from "../systems";

import { StatefulRoom } from "../StatefulRoom";
import { AutoOpenDoor } from "../misc/AutoOpenDoor";

/**
 * Represents a room object for the April Fools' version of the The Skeld map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class AprilShipStatus<RoomType extends StatefulRoom> extends InnerShipStatus<RoomType> {
    static roomDoors: Partial<Record<SystemType, number[]>> = {
        [SystemType.UpperEngine]: [2, 5],
        [SystemType.Cafeteria]: [0, 3, 8],
        [SystemType.MedBay]: [10],
        [SystemType.Security]: [6],
        [SystemType.Electrical]: [9],
        [SystemType.Storage]: [1, 7, 12],
        [SystemType.LowerEngine]: [4, 11]
    };

    initialSpawnCenter = new Vector2(0.72, 0.62);
    meetingSpawnCenter = new Vector2(0.72, 0.62);

    setupSystems() {
        this.systems.set(SystemType.Reactor, new ReactorSystem(this, SystemType.Reactor, 60));
        this.systems.set(SystemType.Electrical, new SwitchSystem(this, SystemType.Electrical));
        this.systems.set(SystemType.O2, new LifeSuppSystem(this, SystemType.O2));
        this.systems.set(SystemType.MedBay, new MedScanSystem(this, SystemType.MedBay));
        this.systems.set(SystemType.Security, new SecurityCameraSystem(this, SystemType.Security));
        this.systems.set(SystemType.Communications, new HudOverrideSystem(this, SystemType.Communications));
        
        const autoDoorsSystem = new AutoDoorsSystem(this, SystemType.Doors);
        autoDoorsSystem.doors = [
            new AutoOpenDoor(autoDoorsSystem, 0, true),
            new AutoOpenDoor(autoDoorsSystem, 1, true),
            new AutoOpenDoor(autoDoorsSystem, 2, true),
            new AutoOpenDoor(autoDoorsSystem, 3, true),
            new AutoOpenDoor(autoDoorsSystem, 4, true),
            new AutoOpenDoor(autoDoorsSystem, 5, true),
            new AutoOpenDoor(autoDoorsSystem, 6, true),
            new AutoOpenDoor(autoDoorsSystem, 7, true),
            new AutoOpenDoor(autoDoorsSystem, 8, true),
            new AutoOpenDoor(autoDoorsSystem, 9, true),
            new AutoOpenDoor(autoDoorsSystem, 10, true),
            new AutoOpenDoor(autoDoorsSystem, 11, true),
            new AutoOpenDoor(autoDoorsSystem, 12, true),
            new AutoOpenDoor(autoDoorsSystem, 13, true),
        ];
        this.systems.set(SystemType.Doors, autoDoorsSystem);

        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage));
    }
    
    async processAwake(): Promise<void> {
        void 0;
    }

    getDoorsInRoom(room: SystemType) {
        return AprilShipStatus.roomDoors[room] || [];
    }

    getTasks() {
        return Object.values(AprilFoolsTheSkeldTasks);
    }
}
