import { HazelReader } from "@skeldjs/util";
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
import { NetworkableConstructor } from "../Heritable";
import { Networkable } from "../Networkable";

/**
 * Represents a room object for the The Skeld map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class SkeldShipStatus<RoomType extends Hostable = Hostable> extends InnerShipStatus<RoomType> {
    static type = SpawnType.ShipStatus as const;
    type = SpawnType.ShipStatus as const;

    static classname = "ShipStatus" as const;
    classname = "ShipStatus" as const;

    static roomDoors = {
        [SystemType.Storage]: [1, 7, 12],
        [SystemType.Cafeteria]: [0, 3, 8],
        [SystemType.UpperEngine]: [2, 5],
        [SystemType.Electrical]: [9],
        [SystemType.MedBay]: [10],
        [SystemType.Security]: [6],
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

    constructor(
        room: RoomType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | ShipStatusData
    ) {
        super(room, netid, ownerid, flags, data);
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
        switch (rpc.tag) {
            case RpcMessageTag.CloseDoorsOfType:
                await this._handleCloseDoorsOfType(rpc as CloseDoorsOfTypeMessage);
                break;
            default:
                await super.HandleRpc(rpc);
                break;
        }
    }

    private async _handleCloseDoorsOfType(rpc: CloseDoorsOfTypeMessage) {
        const doorsinRoom = SkeldShipStatus.roomDoors[rpc.systemid as keyof typeof SkeldShipStatus.roomDoors];

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
                brightness: 255,
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

        const autodoorsystem = this.systems[SystemType.Doors];
        autodoorsystem.doors = [
            new AutoOpenDoor(autodoorsystem, 0, true),
            new AutoOpenDoor(autodoorsystem, 1, true),
            new AutoOpenDoor(autodoorsystem, 2, true),
            new AutoOpenDoor(autodoorsystem, 3, true),
            new AutoOpenDoor(autodoorsystem, 4, true),
            new AutoOpenDoor(autodoorsystem, 5, true),
            new AutoOpenDoor(autodoorsystem, 6, true),
            new AutoOpenDoor(autodoorsystem, 7, true),
            new AutoOpenDoor(autodoorsystem, 8, true),
            new AutoOpenDoor(autodoorsystem, 9, true),
            new AutoOpenDoor(autodoorsystem, 10, true),
            new AutoOpenDoor(autodoorsystem, 11, true),
            new AutoOpenDoor(autodoorsystem, 12, true),
            new AutoOpenDoor(autodoorsystem, 13, true),
        ];
    }
}
