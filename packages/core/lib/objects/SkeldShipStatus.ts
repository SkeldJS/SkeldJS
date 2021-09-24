import { HazelReader, Vector2 } from "@skeldjs/util";
import { BaseRpcMessage, CloseDoorsOfTypeMessage } from "@skeldjs/protocol";
import { RpcMessageTag, SpawnType, SystemType } from "@skeldjs/constant";

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
 * Represents a room object for the The Skeld map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class SkeldShipStatus<RoomType extends Hostable = Hostable> extends InnerShipStatus<RoomType> {
    static roomDoors = {
        [SystemType.Storage]: [1, 7, 12],
        [SystemType.Cafeteria]: [0, 3, 8],
        [SystemType.UpperEngine]: [2, 5],
        [SystemType.Electrical]: [9],
        [SystemType.MedBay]: [10],
        [SystemType.Security]: [6],
        [SystemType.LowerEngine]: [4, 11]
    }

    initialSpawnCenter = new Vector2(-0.72, 0.62);
    meetingSpawnCenter = new Vector2(-0.72, 0.62);

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
        if (component === SkeldShipStatus as NetworkableConstructor<any>) {
            return this.components[0] as unknown as T;
        }

        return undefined;
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
        const autodoor = this.systems.get(SystemType.Doors)! as AutoDoorsSystem;
        const doorsinRoom = SkeldShipStatus.roomDoors[rpc.systemId as keyof typeof SkeldShipStatus.roomDoors];

        for (const doorId of doorsinRoom) {
            autodoor.closeDoor(doorId);
        }
    }

    Setup() {
        this.systems.set(SystemType.Reactor, new ReactorSystem(this, {
            timer: 10000,
            completed: new Set,
        }),);
        this.systems.set(SystemType.Electrical, new SwitchSystem(this, {
            expected: [false, false, false, false, false],
            actual: [false, false, false, false, false],
            brightness: 100,
        }));
        this.systems.set(SystemType.O2, new LifeSuppSystem(this, {
            timer: 10000,
            completed: new Set,
        }));
        this.systems.set(SystemType.MedBay, new MedScanSystem(this, {
            queue: [],
        }));
        this.systems.set(SystemType.Security, new SecurityCameraSystem(this, {
            players: new Set,
        }));
        this.systems.set(SystemType.Communications, new HudOverrideSystem(this, {
            sabotaged: false,
        }));
        this.systems.set(SystemType.Doors, new AutoDoorsSystem(this, {
            dirtyBit: 0,
            doors: [],
        }));
        this.systems.set(SystemType.Sabotage, new SabotageSystem(this, {
            cooldown: 0,
        }));

        const autodoor = this.systems.get(SystemType.Doors)! as AutoDoorsSystem;
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
