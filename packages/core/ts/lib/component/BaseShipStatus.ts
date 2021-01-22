import { HazelBuffer, PropagatedEvents } from "@skeldjs/util";

import {
    RpcTag,
    SpawnID,
    SystemType
} from "@skeldjs/constant";

import {
    RpcMessage
} from "@skeldjs/protocol";

import {
    DeconSystem,
    HudOverrideSystem,
    LifeSuppSystem,
    MedScanSystem,
    SecurityCameraSystem,
    HqHudSystem,
    AutoDoorsSystem,
    DoorsSystem,
    SabotageSystem,
    SwitchSystem,
    ReactorSystem,
    SystemStatus
} from "../system";

import { SystemStatusEvents } from "../system/events";

import { Networkable } from "../Networkable";
import { Global } from "../Global";
import { Room } from "../Room";

type AllSystems = Partial<{
    [SystemType.Reactor]: ReactorSystem,
    [SystemType.Electrical]: SwitchSystem,
    [SystemType.O2]: LifeSuppSystem,
    [SystemType.MedBay]: MedScanSystem,
    [SystemType.Security]: SecurityCameraSystem,
    [SystemType.Communications]: HudOverrideSystem|HqHudSystem,
    [SystemType.Doors]: AutoDoorsSystem|DoorsSystem,
    [SystemType.Sabotage]: SabotageSystem,
    [SystemType.Decontamination]: DeconSystem,
    [SystemType.Decontamination2]: DeconSystem,
    [SystemType.Laboratory]: ReactorSystem
}>;

export interface ShipStatusData {
    systems: AllSystems;
}

export type ShipStatusEvents = PropagatedEvents<SystemStatus,SystemStatusEvents> & {

}

export type ShipStatusType = SpawnID.ShipStatus|SpawnID.Headquarters|SpawnID.PlanetMap|SpawnID.AprilShipStatus|SpawnID.Airship;
export type ShipStatusClassname = "ShipStatus"|"Headquarters"|"PlanetMap"|"AprilShipStatus"|"Airship";

export class BaseShipStatus extends Networkable<ShipStatusEvents> {
    static type: ShipStatusType;
    type: ShipStatusType;

    static classname: ShipStatusClassname;
    classname: ShipStatusClassname;

    systems: AllSystems;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|ShipStatusData) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as Global;
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            for (let i = 0; i < 32; i++) {
                const system = this.systems[i] as SystemStatus;

                if (system) {
                    system.Deserialize(reader, spawn);
                }
            }
        } else {
            const mask = reader.upacked();

            for (let i = 0; i < 32; i++) {
                const system = this.systems[i] as SystemStatus;

                if (system && (mask & (1 << i))) {
                    system.Deserialize(reader, spawn);
                }
            }
        }
    }

    /* eslint-disable-next-line */
    Serialize(writer: HazelBuffer, spawn: boolean = false) {

    }

    HandleRPC(message: RpcMessage) {
        switch (message.rpcid) {
            case RpcTag.RepairSystem:
                const system = this.systems[message.systemid] as SystemStatus;
                const player = this.room.getPlayerByNetID(message.repairerid);

                if (system && player) {
                    system.HandleRepair(player, message.value);
                }
                break;
        }
    }
}
