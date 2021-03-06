import { HazelBuffer } from "@skeldjs/util";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerData } from "../PlayerData";
import { Hostable } from "../Hostable";

import { MessageTag, RpcTag, SpawnID } from "@skeldjs/constant";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface PlayerPhysicsData {}

export type PlayerPhysicsEvents = NetworkableEvents & {
    "player.entervent": {
        ventid: number;
    };
    "player.exitvent": {
        ventid: number;
    };
};

export class PlayerPhysics extends Networkable<PlayerPhysicsData, PlayerPhysicsEvents> {
    static type = SpawnID.Player as const;
    type = SpawnID.Player as const;

    static classname = "PlayerPhysics" as const;
    classname = "PlayerPhysics" as const;

    vent: number;

    constructor(
        room: Hostable,
        netid: number,
        ownerid: number,
        data?: HazelBuffer | PlayerPhysicsData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as PlayerData;
    }

    private _enterVent(ventid: number) {
        this.vent = ventid;
        this.emit("player.entervent", ventid);
    }

    enterVent(ventid: number) {
        this._enterVent(ventid);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.EnterVent,
            netid: this.netid,
            ventid,
        });
    }

    private _exitVent(ventid: number) {
        this.vent = null;
        this.emit("player.exitvent", ventid);
    }

    exitVent(ventid: number) {
        this._exitVent(ventid);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.ExitVent,
            netid: this.netid,
            ventid,
        });
    }
}
