import { HazelReader, Vector2 } from "@skeldjs/util";
import { SpawnType, SystemType } from "@skeldjs/constant";
import { CloseDoorsOfTypeMessage } from "@skeldjs/protocol";

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
} from "../systems";

import { Networkable, NetworkableConstructor } from "../Networkable";
import { AutoOpenDoor, Door } from "../..";

/**
 * Represents a room object for the Airship map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class AirshipStatus<RoomType extends Hostable = Hostable> extends InnerShipStatus<RoomType> {
    static roomDoors = {
        [SystemType.Communications]: [0, 1, 2, 3],
        [SystemType.Brig]: [4, 5, 6],
        [SystemType.Kitchen]: [7, 8, 9],
        [SystemType.MainHall]: [10, 11],
        [SystemType.Records]: [12, 13, 14],
        [SystemType.Lounge]: [15, 16, 17, 18],
        [SystemType.Medical]: [19, 20]
    }

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

    protected async _handleCloseDoorsOfType(rpc: CloseDoorsOfTypeMessage) {
        const electricaldoors = this.systems.get(SystemType.Decontamination)! as ElectricalDoorsSystem;
        const doorsInRoom = AirshipStatus.roomDoors[rpc.systemId as keyof typeof AirshipStatus.roomDoors];

        for (const doorId of doorsInRoom) {
            electricaldoors.closeDoor(doorId);
        }
    }

    Setup() {
        this.systems.set(SystemType.Electrical, new SwitchSystem(this, {
            expected: [false, false, false, false, false],
            actual: [false, false, false, false, false],
            brightness: 255,
        }));

        this.systems.set(SystemType.MedBay, new MedScanSystem(this, {
            queue: []
        }));

        this.systems.set(SystemType.Doors, new DoorsSystem(this, {
            doors: [],
            cooldowns: new Map
        }));

        this.systems.set(SystemType.Communications, new HudOverrideSystem(this, {
            sabotaged: false,
        }));

        this.systems.set(SystemType.GapRoom, new MovingPlatformSystem(this, {
            target: undefined,
            side: MovingPlatformSide.Left,
            useId: 0,
        }));

        this.systems.set(SystemType.Decontamination, new ElectricalDoorsSystem(this, {
            doors: [],
        }));

        this.systems.set(SystemType.Decontamination2, new AutoDoorsSystem(this, {
            dirtyBit: 0,
            doors: [],
        }));

        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, {
            cooldown: 0,
        }));

        this.systems.set(SystemType.Security, new SecurityCameraSystem(this, {
            players: new Set,
        }));

        const electricaldoors = this.systems.get(SystemType.Decontamination) as ElectricalDoorsSystem;
        electricaldoors.doors = [
            new Door(electricaldoors, 0, true),
            new Door(electricaldoors, 1, true),
            new Door(electricaldoors, 2, true),
            new Door(electricaldoors, 3, true),
            new Door(electricaldoors, 4, true),
            new Door(electricaldoors, 5, true),
            new Door(electricaldoors, 6, true),
            new Door(electricaldoors, 7, true),
            new Door(electricaldoors, 8, true),
            new Door(electricaldoors, 9, true),
            new Door(electricaldoors, 10, true),
            new Door(electricaldoors, 11, true)
        ];

        const autodoors = this.systems.get(SystemType.Decontamination2) as AutoDoorsSystem;
        autodoors.doors = [
            new AutoOpenDoor(autodoors, 15, true),
            new AutoOpenDoor(autodoors, 16, true),
            new AutoOpenDoor(autodoors, 17, true),
            new AutoOpenDoor(autodoors, 18, true)
        ];
    }
}
