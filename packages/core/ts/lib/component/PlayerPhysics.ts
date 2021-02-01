import { HazelBuffer } from "@skeldjs/util";

import { Networkable } from "../Networkable";
import { PlayerData } from "../PlayerData";
import { Room } from "../Room";

import { MessageTag, RpcTag, SpawnID } from "@skeldjs/constant";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface PlayerPhysicsData {

}

export type PlayerPhysicsEvents = {
    enterVent: (ventid: number) => void;
    exitVent: (ventid: number) => void;
}

export class PlayerPhysics extends Networkable<PlayerPhysicsEvents> {
    static type = SpawnID.Player as const;
    type = SpawnID.Player as const;

    static classname = "PlayerPhysics" as const;
    classname = "PlayerPhysics" as const;

    vent: number;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|PlayerPhysicsData) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as PlayerData;
    }

    private _enterVent(ventid: number) {
        this.vent = ventid;
        this.emit("enterVent", ventid);
    }

    enterVent(ventid: number) {
        this._enterVent(ventid);

        this.room.client.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.EnterVent,
            netid: this.netid,
            ventid
        });
    }

    private _exitVent(ventid: number) {
        this.vent = null;
        this.emit("exitVent", ventid);
    }

    exitVent(ventid: number) {
        this._exitVent(ventid);

        this.room.client.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.ExitVent,
            netid: this.netid,
            ventid
        });
    }
}
