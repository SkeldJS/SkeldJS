import { SpawnType, SystemType } from "@skeldjs/constant";
import { HazelReader, Vector2 } from "@skeldjs/util";
import { PolusTasks } from "@skeldjs/data";

import {
    DeconSystem,
    MedScanSystem,
    ReactorSystem,
    SabotageSystem,
    SwitchSystem,
    DoorsSystem,
    SecurityCameraSystem,
    HudOverrideSystem,
} from "../systems";

import { Door } from "../misc/Door";
import { ShipStatusData, InnerShipStatus } from "./InnerShipStatus";
import { Hostable } from "../Hostable";
import { Networkable, NetworkableConstructor } from "../Networkable";
import { PlayerData } from "../PlayerData";

/**
 * Represents a room object for the Polus map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class PolusShipStatus<RoomType extends Hostable = Hostable> extends InnerShipStatus<RoomType> {
    static roomDoors: Partial<Record<SystemType, number[]>> = {
        [SystemType.Electrical]: [0, 1, 2],
        [SystemType.O2]: [3, 4],
        [SystemType.Weapons]: [5],
        [SystemType.Communications]: [7],
        [SystemType.Office]: [7, 8],
        [SystemType.Laboratory]: [9, 10],
        [SystemType.Storage]: [11],
        [SystemType.Decontamination]: [12, 13, 14, 15]
    };

    initialSpawnCenter = new Vector2(16.64, -2.46);
    meetingSpawnCenter = new Vector2(17.4, -16.286);
    meetingSpawnCenter2 = new Vector2(17.4, -17.515);

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
        if (this.spawnType === SpawnType.Polus && component === PolusShipStatus as NetworkableConstructor<any>) {
            return this.components[0] as unknown as T;
        }

        return undefined;
    }

    Setup() {
        this.systems.set(SystemType.Electrical, new SwitchSystem(this, SystemType.Electrical, {
            expected: [false, false, false, false, false],
            actual: [false, false, false, false, false],
            brightness: 255,
        }));
        this.systems.set(SystemType.MedBay, new MedScanSystem(this, SystemType.MedBay, {
            queue: [],
        }));
        this.systems.set(SystemType.Security, new SecurityCameraSystem(this, SystemType.Security, {
            players: new Set,
        }));
        this.systems.set(SystemType.Communications, new HudOverrideSystem(this, SystemType.Communications, {
            sabotaged: false,
        }));
        this.systems.set(SystemType.Doors, new DoorsSystem(this, SystemType.Doors, {
            doors: [],
            cooldowns: new Map,
        }));
        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage, {
            cooldown: 0,
        }));
        this.systems.set(SystemType.Decontamination, new DeconSystem(this, SystemType.Decontamination, {
            timer: 0,
            state: 0,
        }));
        this.systems.set(SystemType.Decontamination2, new DeconSystem(this, SystemType.Decontamination2, {
            timer: 0,
            state: 0,
        }));
        this.systems.set(SystemType.Laboratory, new ReactorSystem(this, SystemType.Laboratory, {
            timer: 10000,
            completed: new Set,
        }));

        const doorsystem = this.systems.get(SystemType.Doors)! as DoorsSystem;
        doorsystem.doors = [
            new Door(doorsystem, 0, true),
            new Door(doorsystem, 1, true),
            new Door(doorsystem, 2, true),
            new Door(doorsystem, 3, true),
            new Door(doorsystem, 4, true),
            new Door(doorsystem, 5, true),
            new Door(doorsystem, 6, true),
            new Door(doorsystem, 7, true),
            new Door(doorsystem, 8, true),
            new Door(doorsystem, 9, true),
            new Door(doorsystem, 10, true),
            new Door(doorsystem, 11, true),
        ];
    }

    getSpawnPosition(player: PlayerData|number, initialSpawn: boolean) {
        const playerId = typeof player === "number"
            ? player
            : player.playerId!;

        if (initialSpawn) {
            return super.getSpawnPosition(player, initialSpawn);
        }

        const num = ~~(this.room.players.size / 2);
        const num2 = playerId % 15;

        if (num2 < num) {
            const step = Vector2.right.mul(num2).mul(0.6);

            return this.meetingSpawnCenter
                .add(step);
        } else {
            const step = Vector2.right.mul(num2 - num).mul(0.6);

            return this.meetingSpawnCenter2
                .add(step);
        }
    }

    getDoorsInRoom(room: SystemType) {
        return PolusShipStatus.roomDoors[room] || [];
    }

    getTasks() {
        return Object.values(PolusTasks);
    }
}
