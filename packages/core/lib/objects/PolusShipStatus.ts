import { RpcMessageTag, SpawnType, SystemType } from "@skeldjs/constant";
import { BaseRpcMessage, CloseDoorsOfTypeMessage } from "@skeldjs/protocol";
import { HazelReader } from "@skeldjs/util";

import { ShipStatusData, InnerShipStatus } from "./InnerShipStatus";

import { Hostable } from "../Hostable";

import {
    DeconSystem,
    HudOverrideSystem,
    MedScanSystem,
    ReactorSystem,
    SabotageSystem,
    SwitchSystem,
    DoorsSystem,
    SecurityCameraSystem,
} from "../systems";

import { Door } from "../misc/Door";

/**
 * Represents a room object for the Polus map.
 *
 * See {@link ShipStatusEvents} for events to listen to.
 */
export class PolusShipStatus<RoomType extends Hostable = Hostable> extends InnerShipStatus<RoomType> {
    static type = SpawnType.PlanetMap as const;
    type = SpawnType.PlanetMap as const;

    static classname = "PlanetMap" as const;
    classname = "PlanetMap" as const;

    static roomDoors = {
        [SystemType.Electrical]: [0, 1, 2],
        [SystemType.O2]: [3, 4],
        [SystemType.Weapons]: [5],
        [SystemType.Communications]: [7],
        [SystemType.Office]: [7, 8],
        [SystemType.Laboratory]: [9, 10],
        [SystemType.Storage]: [11],
        [SystemType.Decontamination]: [12, 13, 14, 15]
    }

    systems!: {
        [SystemType.Electrical]: SwitchSystem<RoomType>;
        [SystemType.MedBay]: MedScanSystem<RoomType>;
        [SystemType.Security]: SecurityCameraSystem<RoomType>;
        [SystemType.Communications]: HudOverrideSystem<RoomType>;
        [SystemType.Doors]: DoorsSystem<RoomType>;
        [SystemType.Sabotage]: SabotageSystem<RoomType>;
        [SystemType.Decontamination]: DeconSystem<RoomType>;
        [SystemType.Decontamination2]: DeconSystem<RoomType>;
        [SystemType.Laboratory]: ReactorSystem<RoomType>;
    };

    constructor(
        room: RoomType,
        netid: number,
        ownerid: number,
        data?: HazelReader | ShipStatusData
    ) {
        super(room, netid, ownerid, data);
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
        const doorsinRoom = PolusShipStatus.roomDoors[rpc.systemid as keyof typeof PolusShipStatus.roomDoors];

        for (const doorId of doorsinRoom) {
            this.systems[SystemType.Doors].closeDoor(doorId);
        }
    }

    Setup() {
        this.systems = {
            [SystemType.Electrical]: new SwitchSystem(this, {
                expected: [false, false, false, false, false],
                actual: [false, false, false, false, false],
                brightness: 100,
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
            [SystemType.Doors]: new DoorsSystem(this, {
                doors: [],
                cooldowns: new Map,
            }),
            [SystemType.Sabotage]: new SabotageSystem(this, {
                cooldown: 0,
            }),
            [SystemType.Decontamination]: new DeconSystem(this, {
                timer: 10000,
                state: 0,
            }),
            [SystemType.Decontamination2]: new DeconSystem(this, {
                timer: 10000,
                state: 0,
            }),
            [SystemType.Laboratory]: new ReactorSystem(this, {
                timer: 10000,
                completed: new Set,
            }),
        };

        const doorsystem = this.systems[SystemType.Doors];
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
}
