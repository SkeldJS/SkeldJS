import { HazelReader, Vector2 } from "@skeldjs/hazel";
import { GameMap, mapTasksData, RpcMessageTag, SystemType } from "@skeldjs/au-constants";
import { BaseRpcMessage, RepairSystemMessage } from "@skeldjs/au-protocol";

import { ShipStatus } from "./ShipStatus";

import { StatefulRoom } from "../StatefulRoom";

import {
    AutoDoorsSystem,
    HudOverrideSystem,
    SabotageSystem,
    SecurityCameraSystem,
    SwitchSystem,
    ElectricalDoorsSystem,
    MovingPlatformSide,
    MovingPlatformSystem,
    MedScanSystem,
    DoorsSystem,
    HeliSabotageSystem,
    Door,
    AutoOpenDoor,
} from "../systems";

export enum ElectricalDoorsAirship {
    BottomRightNorth,
    CenterSouth,
    TopRightSouth,
    TopCenterSouth,
    TopLeftSouth,
    CenterLeftEast,
    CenterRightWest,
    TopRightWest,
    TopLeftEast,
    BottomRightWest,
    TopLeftWest,
    CenterLeftWest
}

/**
 * Represents a room object for the Airship map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class AirshipStatus<RoomType extends StatefulRoom> extends ShipStatus<RoomType> {
    static electricalRooms = [
        [
            ElectricalDoorsAirship.TopLeftEast,
            ElectricalDoorsAirship.TopLeftSouth
        ],
        [
            ElectricalDoorsAirship.TopLeftEast,
            ElectricalDoorsAirship.TopCenterSouth,
            ElectricalDoorsAirship.TopRightWest
        ],
        [
            ElectricalDoorsAirship.TopRightSouth,
            ElectricalDoorsAirship.TopRightWest
        ],
        [
            ElectricalDoorsAirship.TopRightSouth,
            ElectricalDoorsAirship.CenterRightWest,
            ElectricalDoorsAirship.BottomRightNorth
        ],
        [
            ElectricalDoorsAirship.TopCenterSouth,
            ElectricalDoorsAirship.CenterRightWest,
            ElectricalDoorsAirship.CenterSouth,
            ElectricalDoorsAirship.CenterLeftEast
        ],
        [
            ElectricalDoorsAirship.BottomRightNorth,
            ElectricalDoorsAirship.BottomRightWest
        ],
        [
            ElectricalDoorsAirship.TopLeftSouth,
            ElectricalDoorsAirship.CenterLeftEast,
            ElectricalDoorsAirship.CenterSouth,
            ElectricalDoorsAirship.BottomRightWest
        ]
    ];

    initialSpawnCenter = new Vector2(25, 40);
    meetingSpawnCenter = new Vector2(25, 40);

    async setupSystems() {
        this.systems.set(SystemType.Electrical, new SwitchSystem(this, SystemType.Electrical));

        this.systems.set(SystemType.MedBay, new MedScanSystem(this, SystemType.MedBay));

        const doorsSystem = new DoorsSystem(this, SystemType.Doors);
        this.systems.set(SystemType.Doors, doorsSystem);
        // TODO: figure out actual door systems
        doorsSystem.doors = [
            new Door(doorsSystem, SystemType.Comms, 0),
            new Door(doorsSystem, SystemType.Comms, 1),
            new Door(doorsSystem, SystemType.Comms, 2),
            new Door(doorsSystem, SystemType.Comms, 3),
            new Door(doorsSystem, SystemType.Brig, 4),
            new Door(doorsSystem, SystemType.Brig, 5),
            new Door(doorsSystem, SystemType.Brig, 6),
            new Door(doorsSystem, SystemType.Kitchen, 7),
            new Door(doorsSystem, SystemType.Kitchen, 8),
            new Door(doorsSystem, SystemType.Kitchen, 9),
            new Door(doorsSystem, SystemType.MainHall, 10),
            new Door(doorsSystem, SystemType.MainHall, 11),
            new Door(doorsSystem, SystemType.Records, 12),
            new Door(doorsSystem, SystemType.Records, 13),
            new Door(doorsSystem, SystemType.Records, 14),
            new Door(doorsSystem, SystemType.Medical, 19),
            new Door(doorsSystem, SystemType.Medical, 20),
        ];

        this.systems.set(SystemType.Comms, new HudOverrideSystem(this, SystemType.Comms));

        const movingPlatformSystem = new MovingPlatformSystem(this, SystemType.GapRoom);
        this.systems.set(SystemType.GapRoom, movingPlatformSystem);
        movingPlatformSystem.side = MovingPlatformSide.Left;

        const heliSabotageSystem = new HeliSabotageSystem(this, SystemType.Reactor);
        this.systems.set(SystemType.Reactor, heliSabotageSystem);
        heliSabotageSystem.completedConsoles = new Set([0, 1]);

        const electricalDoors = new ElectricalDoorsSystem(this, SystemType.Decontamination);
        this.systems.set(SystemType.Decontamination, electricalDoors);
        electricalDoors.doors = [
            new Door(electricalDoors, SystemType.Hallway, 0),
            new Door(electricalDoors, SystemType.Hallway, 1),
            new Door(electricalDoors, SystemType.Hallway, 2),
            new Door(electricalDoors, SystemType.Hallway, 3),
            new Door(electricalDoors, SystemType.Hallway, 4),
            new Door(electricalDoors, SystemType.Hallway, 5),
            new Door(electricalDoors, SystemType.Hallway, 6),
            new Door(electricalDoors, SystemType.Hallway, 7),
            new Door(electricalDoors, SystemType.Hallway, 8),
            new Door(electricalDoors, SystemType.Hallway, 9),
            new Door(electricalDoors, SystemType.Hallway, 10),
            new Door(electricalDoors, SystemType.Hallway, 11)
        ];

        const autoDoors = new AutoDoorsSystem(this, SystemType.Decontamination2);
        this.systems.set(SystemType.Decontamination2, autoDoors);
        autoDoors.doors = [
            new AutoOpenDoor(autoDoors, SystemType.Lounge, 15),
            new AutoOpenDoor(autoDoors, SystemType.Lounge, 16),
            new AutoOpenDoor(autoDoors, SystemType.Lounge, 17),
            new AutoOpenDoor(autoDoors, SystemType.Lounge, 18)
        ];

        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage));

        this.systems.set(SystemType.Security, new SecurityCameraSystem(this, SystemType.Security));
        await electricalDoors.randomizeDoorMaze(AirshipStatus.electricalRooms, [ ElectricalDoorsAirship.TopLeftWest, ElectricalDoorsAirship.CenterLeftWest ]);
    }

    parseRemoteCall(rpcTag: RpcMessageTag, reader: HazelReader): BaseRpcMessage | undefined {
        switch (rpcTag) {
            case RpcMessageTag.RepairSystem: return RepairSystemMessage.deserializeFromReader(reader);
        }
        return super.parseRemoteCall(rpcTag, reader);
    }

    getTasks() {
        return mapTasksData[GameMap.Airship];
    }
    
    getStartWaitSeconds(): number {
        return 15;
    }
}
