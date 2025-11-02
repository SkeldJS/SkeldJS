import { GameMap, mapTasksData, SpawnType, SystemType } from "@skeldjs/constant";
import { HazelReader, Vector2 } from "@skeldjs/hazel";

import {
    DeconSystem,
    MedScanSystem,
    ReactorSystem,
    SabotageSystem,
    SwitchSystem,
    DoorsSystem,
    SecurityCameraSystem,
    HudOverrideSystem,
    Door,
} from "../systems";

import { ShipStatus } from "./ShipStatus";
import { StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";

/**
 * Represents a room object for the Polus map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class PolusShipStatus<RoomType extends StatefulRoom> extends ShipStatus<RoomType> {
    initialSpawnCenter = new Vector2(16.64, -2.46);
    meetingSpawnCenter = new Vector2(17.4, -16.286);
    meetingSpawnCenter2 = new Vector2(17.4, -17.515);

    async setupSystems() {
        this.systems.set(SystemType.Electrical, new SwitchSystem(this, SystemType.Electrical));
        this.systems.set(SystemType.MedBay, new MedScanSystem(this, SystemType.MedBay));
        this.systems.set(SystemType.Security, new SecurityCameraSystem(this, SystemType.Security));
        this.systems.set(SystemType.Comms, new HudOverrideSystem(this, SystemType.Comms));
        
        const doorsSystem = new DoorsSystem(this, SystemType.Doors);
        this.systems.set(SystemType.Doors, doorsSystem);
        doorsSystem.doors = [
            new Door(doorsSystem, SystemType.Electrical, 0),
            new Door(doorsSystem, SystemType.Electrical, 1),
            new Door(doorsSystem, SystemType.Electrical, 2),
            new Door(doorsSystem, SystemType.LifeSupp, 3),
            new Door(doorsSystem, SystemType.LifeSupp, 4),
            new Door(doorsSystem, SystemType.Weapons, 5),
            new Door(doorsSystem, SystemType.Comms, 6),
            new Door(doorsSystem, SystemType.Office, 7),
            new Door(doorsSystem, SystemType.Office, 8),
            new Door(doorsSystem, SystemType.Laboratory, 9),
            new Door(doorsSystem, SystemType.Storage, 10),
            new Door(doorsSystem, SystemType.Decontamination, 11),
        ];

        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage));
        this.systems.set(SystemType.Decontamination, new DeconSystem(this, SystemType.Decontamination));
        this.systems.set(SystemType.Decontamination2, new DeconSystem(this, SystemType.Decontamination2));

        const reactorSystem = new ReactorSystem(this, SystemType.Laboratory);
        this.systems.set(SystemType.Laboratory, reactorSystem);
        reactorSystem.sabotageDuration = 60;
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

    getTasks() {
        return mapTasksData[GameMap.Polus];
    }
    
    getStartWaitSeconds(): number {
        return 10;
    }
}
