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
import { PlayerData } from "../PlayerData";

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
        const systems = Object.values(this.systems);
        if (spawn) {
            for (let i = 0; i < systems.length; i++) {
                const system = systems[i];

                system.Serialize(writer, spawn);
            }
        } else {
            let mask = this.dirtyBit;
            const writer2 = HazelBuffer.alloc(0);
            for (let i = 0; i < systems.length; i++) {
                const system = systems[i];

                if (this.dirtyBit & (1 << system.systemType)) {
                    mask |= 1 << system.systemType;
                    system.Serialize(writer2, spawn);
                    system.dirty = false;
                }
            }
            writer.upacked(mask);
            writer.buf(writer2);
        }
        this.dirtyBit = 0;
        return true;
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

    FixedUpdate(delta: number) {
        const systems = Object.values(this.systems);
        for (let i = 0; i < systems.length; i++) {
            const system = systems[i];

            system.Detoriorate(delta);
        }
    }

    selectInfected() {
        const available = [...this.room.players.values()].filter(player => player.data && !player.data.disconnected && !player.data.dead);
        const max = available.length < 7 ? 1 : available.length < 9 ? 2 : 3;
        const impostors: PlayerData[] = [];

        for (let i = 0; i < Math.min(this.room.settings.impostors, max); i++) {
            const random = ~~(available.length - 1);
            impostors.push(available[random]);
            available.splice(random, 1);
        }

        this.room.host.control.setInfected(impostors);
    }

    begin() {
        for (const [ , player ] of this.room.players) {
            this.room.gamedata.setTasks(player, [1, 2, 3]);
        }
    }
}
