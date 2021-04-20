import { HazelReader, HazelWriter } from "@skeldjs/util";
import { RpcMessageTag, SpawnType, SystemType } from "@skeldjs/constant";

import { SystemStatus } from "../system";

import { SystemStatusEvents } from "../system/events";

import { Networkable } from "../Networkable";
import { Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";

type AllSystems = Partial<Record<SystemType, SystemStatus<any, any>>>;

export interface ShipStatusData {
    systems: AllSystems;
}

export interface ShipStatusEvents extends SystemStatusEvents {}

export type ShipStatusType =
    | SpawnType.ShipStatus
    | SpawnType.Headquarters
    | SpawnType.PlanetMap
    | SpawnType.AprilShipStatus
    | SpawnType.Airship;

export type ShipStatusClassname =
    | "ShipStatus"
    | "Headquarters"
    | "PlanetMap"
    | "AprilShipStatus"
    | "Airship";

export class InnerShipStatus extends Networkable<
    ShipStatusData,
    ShipStatusEvents
> {
    static type: ShipStatusType;
    type: ShipStatusType;

    static classname: ShipStatusClassname;
    classname: ShipStatusClassname;

    systems: AllSystems;

    constructor(
        room: Hostable<any>,
        netid: number,
        ownerid: number,
        data?: HazelReader | ShipStatusData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as Hostable;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Setup() {}

    Deserialize(reader: HazelReader, spawn: boolean = false) {
        if (!this.systems) this.Setup();

        while (reader.left) {
            const [tag, mreader] = reader.message();
            const system = this.systems[tag] as SystemStatus;

            if (system) {
                system.Deserialize(mreader, spawn);
            }
        }
    }

    /* eslint-disable-next-line */
    Serialize(writer: HazelWriter, spawn: boolean = false) {
        if (!this.systems) this.Setup();
        const systems = Object.values(this.systems);
        for (let i = 0; i < systems.length; i++) {
            const system = systems[i];

            if (system.dirty) {
                writer.begin(i);
                system.Serialize(writer, spawn);
                writer.end();
            }
        }

        this.dirtyBit = 0;
        return true;
    }

    HandleRpc(callid: RpcMessageTag, reader: HazelReader) {
        switch (callid) {
            case RpcMessageTag.RepairSystem:
                const systemid = reader.uint8();
                const pcnetid = reader.upacked();
                const amount = reader.uint8();

                const system = this.systems[systemid] as SystemStatus;
                const player = this.room.getPlayerByNetId(pcnetid);

                if (system && player) {
                    system.HandleRepair(player, amount);
                }
                break;
        }
    }

    FixedUpdate(delta: number) {
        if (!this.systems) this.Setup();

        const systems = Object.values(this.systems);
        for (let i = 0; i < systems.length; i++) {
            const system = systems[i];

            system.Detoriorate(delta);
        }
    }

    selectInfected() {
        const available = [...this.room.players.values()].filter(
            (player) =>
                player.data && !player.data.disconnected && !player.data.dead
        );
        const max = available.length < 7 ? 1 : available.length < 9 ? 2 : 3;
        const impostors: PlayerData[] = [];

        for (
            let i = 0;
            i < Math.min(this.room.settings.numImpostors, max);
            i++
        ) {
            const random = ~~(available.length - 1);
            impostors.push(available[random]);
            available.splice(random, 1);
        }

        this.room.host.control.setInfected(impostors);
    }

    begin() {
        for (const [, player] of this.room.players) {
            this.room.gamedata.setTasks(player, [1, 2, 3]);
        }
    }
}
