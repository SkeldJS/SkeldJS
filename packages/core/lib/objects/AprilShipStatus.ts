import { HazelReader, Vector2 } from "@skeldjs/util";
import { RpcMessageTag, SpawnType, SystemType } from "@skeldjs/constant";
import { BaseRpcMessage, CloseDoorsOfTypeMessage } from "@skeldjs/protocol";

import { ShipStatusData, InnerShipStatus } from "./InnerShipStatus";

import {
    HudOverrideSystem,
    LifeSuppSystem,
    MedScanSystem,
    SecurityCameraSystem,
    AutoDoorsSystem,
    SabotageSystem,
    SwitchSystem,
    ReactorSystem,
} from "../systems";

import { Hostable } from "../Hostable";
import { AutoOpenDoor } from "../misc/AutoOpenDoor";
import { Networkable, NetworkableConstructor } from "../Networkable";

/**
 * Represents a room object for the April Fools' version of the The Skeld map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class AprilShipStatus<RoomType extends Hostable = Hostable> extends InnerShipStatus<RoomType> {
    static roomDoors = {
        [SystemType.UpperEngine]: [2, 5],
        [SystemType.Cafeteria]: [0, 3, 8],
        [SystemType.MedBay]: [10],
        [SystemType.Security]: [6],
        [SystemType.Electrical]: [9],
        [SystemType.Storage]: [1, 7, 12],
        [SystemType.LowerEngine]: [4, 11]
    }

    systems!: {
        [SystemType.Reactor]: ReactorSystem<RoomType>;
        [SystemType.Electrical]: SwitchSystem<RoomType>;
        [SystemType.O2]: LifeSuppSystem<RoomType>;
        [SystemType.MedBay]: MedScanSystem<RoomType>;
        [SystemType.Security]: SecurityCameraSystem<RoomType>;
        [SystemType.Communications]: HudOverrideSystem<RoomType>;
        [SystemType.Doors]: AutoDoorsSystem<RoomType>;
        [SystemType.Sabotage]: SabotageSystem<RoomType>;
    };

    initialSpawnCenter = new Vector2(0.72, 0.62);
    meetingSpawnCenter = new Vector2(0.72, 0.62);

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
        if (component === AprilShipStatus as NetworkableConstructor<any>) {
            return this.components[0] as unknown as T;
        }

        return super.getComponent(component);
    }

    async HandleRpc(rpc: BaseRpcMessage) {
        switch (rpc.messageTag) {
            case RpcMessageTag.CloseDoorsOfType:
                await this._handleCloseDoorsOfType(rpc as CloseDoorsOfTypeMessage);
                break;
            default:
                await super.HandleRpc(rpc);
                break;
        }
    }

    private async _handleCloseDoorsOfType(rpc: CloseDoorsOfTypeMessage) {
        const doorsinRoom = AprilShipStatus.roomDoors[rpc.systemid as keyof typeof AprilShipStatus.roomDoors];

        for (const doorId of doorsinRoom) {
            this.systems[SystemType.Doors].closeDoor(doorId);
        }
    }

    Setup() {
        this.systems = {
            [SystemType.Reactor]: new ReactorSystem(this, {
                timer: 10000,
                completed: new Set,
            }),
            [SystemType.Electrical]: new SwitchSystem(this, {
                expected: [false, false, false, false, false],
                actual: [false, false, false, false, false],
                brightness: 100,
            }),
            [SystemType.O2]: new LifeSuppSystem(this, {
                timer: 10000,
                completed: new Set,
            }),
            [SystemType.MedBay]: new MedScanSystem(this, {
                queue: [],
            }),
            [SystemType.Security]: new SecurityCameraSystem(this, {
                players: new Set,
            }),
            [SystemType.Communications]: new HudOverrideSystem(this, {
                sabotaged: false,
            }),
            [SystemType.Doors]: new AutoDoorsSystem(this, {
                dirtyBit: 0,
                doors: [],
            }),
            [SystemType.Sabotage]: new SabotageSystem(this, {
                cooldown: 0,
            }),
        };

        const autodoor = this.systems[SystemType.Doors];
        autodoor.doors = [
            new AutoOpenDoor(autodoor, 0, true),
            new AutoOpenDoor(autodoor, 1, true),
            new AutoOpenDoor(autodoor, 2, true),
            new AutoOpenDoor(autodoor, 3, true),
            new AutoOpenDoor(autodoor, 4, true),
            new AutoOpenDoor(autodoor, 5, true),
            new AutoOpenDoor(autodoor, 6, true),
            new AutoOpenDoor(autodoor, 7, true),
            new AutoOpenDoor(autodoor, 8, true),
            new AutoOpenDoor(autodoor, 9, true),
            new AutoOpenDoor(autodoor, 10, true),
            new AutoOpenDoor(autodoor, 11, true),
            new AutoOpenDoor(autodoor, 12, true),
            new AutoOpenDoor(autodoor, 13, true),
        ];
    }
}
