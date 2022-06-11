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

import { Networkable, NetworkableConstructor } from "../Networkable";
import { InnerShipStatus, ShipStatusData } from "./InnerShipStatus";
import { Hostable } from "../Hostable";

/**
 * Represents a room object for the Mira HQ map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class MiraShipStatus<RoomType extends Hostable = Hostable> extends InnerShipStatus<RoomType> {
    initialSpawnCenter = new Vector2(16.64, 2.2);
    meetingSpawnCenter = new Vector2(24.043, 1.72);

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | ShipStatusData
    ) {
        super(room, spawnType, netId, ownerid, flags, data);
    }

    getComponent<T extends Networkable>(
        component: NetworkableConstructor<T>
    ): T|undefined {
        if (this.spawnType === SpawnType.MiraShipStatus && component === MiraShipStatus as NetworkableConstructor<any>) {
            return this.components[0] as unknown as T;
        }

        return super.getComponent(component);
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
            activeConsoles: [],
            completedConsoles: new Set([0, 1]),
        }));
        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage, {
            cooldown: 0,
        }));
        this.systems.set(SystemType.Decontamination, new DeconSystem(this, SystemType.Decontamination, {
            timer: 10000,
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
