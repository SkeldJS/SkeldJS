import { HazelBuffer } from "@skeldjs/util";

import { Networkable } from "../Networkable"
import { PlayerData } from "../PlayerData"
import { Room } from "../Room";

import { MessageTag, RpcTag, SpawnID } from "@skeldjs/constant";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface PlayerPhysicsData {

}

export class PlayerPhysics extends Networkable<PlayerData> {
    static type = SpawnID.Player as const;
    type = SpawnID.Player as const;
    
    static classname = "PlayerPhysics" as const;
    classname = "PlayerPhysics" as const;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|PlayerPhysicsData) {
        super(room, netid, ownerid, data);
    }

    /* eslint-disable-next-line */
    Deserialize(reader: HazelBuffer, spawn: boolean = false) {

    }

    /* eslint-disable-next-line */
    Serialize(writer: HazelBuffer, spawn: boolean = false) {

    }

    enterVent(ventid: number) {
        this.room.client.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.EnterVent,
            netid: this.netid,
            ventid
        });
    }

    exitVent(ventid: number) {
        this.room.client.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.ExitVent,
            netid: this.netid,
            ventid
        });
    }
}