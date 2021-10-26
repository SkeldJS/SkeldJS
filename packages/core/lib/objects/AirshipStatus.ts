import { HazelReader, Vector2 } from "@skeldjs/util";
import { RpcMessageTag, SpawnType, SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { ShipStatusData, InnerShipStatus } from "./InnerShipStatus";

import { Hostable } from "../Hostable";

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
} from "../systems";

import { Networkable, NetworkableConstructor } from "../Networkable";
import { Door } from "../misc/Door";
import { AutoOpenDoor } from "../misc/AutoOpenDoor";

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
export class AirshipStatus<RoomType extends Hostable = Hostable> extends InnerShipStatus<RoomType> {
    static roomDoors: Partial<Record<SystemType, number[]>> = {
        [SystemType.Communications]: [0, 1, 2, 3],
        [SystemType.Brig]: [4, 5, 6],
        [SystemType.Kitchen]: [7, 8, 9],
        [SystemType.MainHall]: [10, 11],
        [SystemType.Records]: [12, 13, 14],
        [SystemType.Lounge]: [15, 16, 17, 18],
        [SystemType.Medical]: [19, 20]
    };

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

    initialSpawnCenter = new Vector2(50, 50);
    meetingSpawnCenter = new Vector2(50, 50);

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | ShipStatusData
    ) {
        super(room, spawnType, netid, ownerid, flags, data);
    }

    getComponent<T extends Networkable>(
        component: NetworkableConstructor<T>
    ): T|undefined {
        if (component === AirshipStatus as NetworkableConstructor<any>) {
            return this.components[0] as unknown as T;
        }

        return super.getComponent(component);
    }

    Setup() {
        this.systems.set(SystemType.Electrical, new SwitchSystem(this, SystemType.Electrical, {
            expected: [false, false, false, false, false],
            actual: [false, false, false, false, false],
            brightness: 255,
        }));

        this.systems.set(SystemType.MedBay, new MedScanSystem(this, SystemType.MedBay, {
            queue: []
        }));

        this.systems.set(SystemType.Doors, new DoorsSystem(this, SystemType.Doors, {
            doors: [],
            cooldowns: new Map
        }));

        this.systems.set(SystemType.Communications, new HudOverrideSystem(this, SystemType.Communications, {
            sabotaged: false,
        }));

        this.systems.set(SystemType.GapRoom, new MovingPlatformSystem(this, SystemType.GapRoom, {
            target: undefined,
            side: MovingPlatformSide.Left,
            useId: 0,
        }));

        this.systems.set(SystemType.Reactor, new HeliSabotageSystem(this, SystemType.Reactor, {
            countdown: 10000,
            resetTimer: 10000,
            activeConsoles: new Map,
            completedConsoles: new Set([0, 1])
        }));

        this.systems.set(SystemType.Decontamination, new ElectricalDoorsSystem(this, SystemType.Decontamination, {
            doors: [],
        }));

        this.systems.set(SystemType.Decontamination2, new AutoDoorsSystem(this, SystemType.Decontamination2, {
            dirtyBit: 0,
            doors: [],
        }));

        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, SystemType.Sabotage, {
            cooldown: 0,
        }));

        this.systems.set(SystemType.Security, new SecurityCameraSystem(this, SystemType.Security, {
            players: new Set,
        }));

        const electricaldoors = this.systems.get(SystemType.Decontamination) as ElectricalDoorsSystem;
        electricaldoors.doors = [
            new Door(electricaldoors, 0, false),
            new Door(electricaldoors, 1, false),
            new Door(electricaldoors, 2, false),
            new Door(electricaldoors, 3, false),
            new Door(electricaldoors, 4, false),
            new Door(electricaldoors, 5, false),
            new Door(electricaldoors, 6, false),
            new Door(electricaldoors, 7, false),
            new Door(electricaldoors, 8, false),
            new Door(electricaldoors, 9, false),
            new Door(electricaldoors, 10, false),
            new Door(electricaldoors, 11, false)
        ];

        const autodoors = this.systems.get(SystemType.Decontamination2) as AutoDoorsSystem;
        autodoors.doors = [
            new AutoOpenDoor(autodoors, 15, true),
            new AutoOpenDoor(autodoors, 16, true),
            new AutoOpenDoor(autodoors, 17, true),
            new AutoOpenDoor(autodoors, 18, true)
        ];

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
            new Door(doorsystem, 12, true),
            new Door(doorsystem, 13, true),
            new Door(doorsystem, 14, true),
            new Door(doorsystem, 15, true),
            new Door(doorsystem, 16, true),
            new Door(doorsystem, 17, true),
            new Door(doorsystem, 18, true),
            new Door(doorsystem, 19, true),
            new Door(doorsystem, 20, true)
        ];

        const hashSet: Set<ElectricalDoorsAirship[]> = new Set;
        let room = AirshipStatus.electricalRooms[0];
        let count = 0;
        while (hashSet.size < AirshipStatus.electricalRooms.length && count++ < 10000) {
            const door = electricaldoors.doors[room[Math.floor(Math.random() * room.length)]];
            const doorSet = AirshipStatus.electricalRooms.find(r => r !== room && r.includes(door.id));

            if (!doorSet)
                continue;

            if (hashSet.size !== hashSet.add(doorSet).size) {
                door.setOpen(true);
            }
            if (Math.random() >= 0.5) {
                hashSet.add(room);
                room = doorSet;
            }
        }
        const exitFlag = Math.random() >= 0.5;
        electricaldoors.doors[ElectricalDoorsAirship.TopLeftWest].setOpen(exitFlag);
        electricaldoors.doors[ElectricalDoorsAirship.CenterLeftWest].setOpen(!exitFlag);
    }

    async HandleRpc(rpc: RepairSystemMessage) {
        if (rpc.messageTag === RpcMessageTag.RepairSystem) {
            if (rpc.systemId === SystemType.Doors) {
                const player = this.room.getPlayerByNetId(rpc.netId);
                const doorId = rpc.amount & 0x1f;

                if (doorId >= 15 && doorId <= 18) { // toilet doors go to auto doors system
                    if (player) {
                        this.systems.get(SystemType.Decontamination2)
                            ?.HandleRepair(player, rpc.amount, rpc);
                    }
                    return;
                }
            }
        }

        await super.HandleRpc(rpc);
    }

    getDoorsInRoom(room: SystemType) {
        return AirshipStatus.roomDoors[room] || [];
    }
}
