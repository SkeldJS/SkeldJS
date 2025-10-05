import { HazelReader, Vector2 } from "@skeldjs/util";
import { SpawnType, SystemType } from "@skeldjs/constant";

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

import { NetworkedObject, NetworkedObjectConstructor } from "../NetworkedObject";
import { InnerShipStatus, ShipStatusData } from "./InnerShipStatus";
import { StatefulRoom } from "../StatefulRoom";

/**
 * Represents a room object for the Mira HQ map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class MiraShipStatus<RoomType extends StatefulRoom = StatefulRoom> extends InnerShipStatus<RoomType> {
    initialSpawnCenter = new Vector2(-4.4, 2.2);
    meetingSpawnCenter = new Vector2(24.043, 1.72);

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

    get owner() {
        return super.owner as RoomType;
    }

    Setup() {
        this.systems.set(SystemType.Reactor, new ReactorSystem(this, SystemType.Reactor, {
            timer: 10000,
            completed: new Set,
        }));
        this.systems.set(SystemType.Electrical, new SwitchSystem(this, SystemType.Electrical, {
            expected: [false, false, false, false, false],
            actual: [false, false, false, false, false],
            brightness: 255,
        }));
        this.systems.set(SystemType.O2, new LifeSuppSystem(this, SystemType.O2, {
            timer: 10000,
            completed: new Set,
        }));
        this.systems.set(SystemType.MedBay, new MedScanSystem(this, SystemType.MedBay, {
            queue: [],
        }));
        this.systems.set(SystemType.Communications, new HqHudSystem(this, SystemType.Communications, {
            timer: 10000,
            activeConsoles: [],
            completedConsoles: new Set([0, 1]),
        }));
        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage, {
            cooldown: 0,
        }));
        this.systems.set(SystemType.Decontamination, new DeconSystem(this, SystemType.Decontamination, {
            timer: 0,
            state: 0,
        }));
    }

    getDoorsInRoom(room: SystemType) {
        return [];
    }

    getTasks() {
        return Object.values(MiraHQTasks);
    }
}
