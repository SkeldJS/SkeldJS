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
import { InnerShipStatus } from "./InnerShipStatus";
import { StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";

/**
 * Represents a room object for the Polus map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class PolusShipStatus<RoomType extends StatefulRoom> extends InnerShipStatus<RoomType> {
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
        ownerId: number,
        flags: number,
    ) {
        super(room, spawnType, netId, ownerId, flags);
    }
    
    async processAwake(): Promise<void> {
        void 0;
    }

    setupSystems() {
        this.systems.set(SystemType.Electrical, new SwitchSystem(this, SystemType.Electrical));
        this.systems.set(SystemType.MedBay, new MedScanSystem(this, SystemType.MedBay));
        this.systems.set(SystemType.Security, new SecurityCameraSystem(this, SystemType.Security));
        this.systems.set(SystemType.Communications, new HudOverrideSystem(this, SystemType.Communications));
        
        const doorsSystem = new DoorsSystem(this, SystemType.Doors);
        this.systems.set(SystemType.Doors, doorsSystem);
        doorsSystem.doors = [
            new Door(doorsSystem, 0, true),
            new Door(doorsSystem, 1, true),
            new Door(doorsSystem, 2, true),
            new Door(doorsSystem, 3, true),
            new Door(doorsSystem, 4, true),
            new Door(doorsSystem, 5, true),
            new Door(doorsSystem, 6, true),
            new Door(doorsSystem, 7, true),
            new Door(doorsSystem, 8, true),
            new Door(doorsSystem, 9, true),
            new Door(doorsSystem, 10, true),
            new Door(doorsSystem, 11, true),
        ];

        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage));
        this.systems.set(SystemType.Decontamination, new DeconSystem(this, SystemType.Decontamination));
        this.systems.set(SystemType.Decontamination2, new DeconSystem(this, SystemType.Decontamination2));
        this.systems.set(SystemType.Laboratory, new ReactorSystem(this, SystemType.Laboratory, 60));
    }

    getSpawnPosition(player: Player<RoomType> | number, initialSpawn: boolean) {
        const playerId = typeof player === "number"
            ? player
            : player.getPlayerId()!;

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
