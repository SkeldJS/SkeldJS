import { HazelBuffer } from "@skeldjs/util";

import {
    MessageTag,
    Opcode,
    PayloadTag,
    RpcTag,
    SpawnID
} from "@skeldjs/constant";

import { RpcMessage } from "@skeldjs/protocol";

import { Networkable } from "../Networkable";
import { Global } from "../Global";
import { PlayerDataResolvable, Room } from "../Room";

export interface VoteBanSystemData {
    clients: Map<number, [number, number, number]>;
}

export type VoteBanSystemEvents = {

}

export class VoteBanSystem extends Networkable<VoteBanSystemEvents> {
    static type = SpawnID.GameData;
    type = SpawnID.GameData;

    static classname = "VoteBanSystem" as const;
    classname = "VoteBanSystem" as const;

    voted: Map<number, [number, number, number]>;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|VoteBanSystemData) {
        super(room, netid, ownerid, data);

        this.voted = new Map;
    }

    get owner() {
        return super.owner as Global;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        const num_players = reader.upacked();

        for (let i = 0; i < num_players; i++) {
            const clientid = reader.uint32();

            if (this.voted.get(clientid)) {
                this.voted.set(clientid, [null, null, null]);
            }

            this.voted.set(clientid, [null, null, null]);
            for (let i = 0; i < 3; i++) {
                reader.upacked();
            }
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean = false) {
        writer.upacked(this.voted.size);

        for (const [ clientid, voters ] of this.voted) {
            writer.uint32(clientid);

            for (let i = 0; i < 3; i++) {
                writer.upacked(voters[i]);
            }
        }
    }

    HandleRPC(message: RpcMessage) {
        switch (message.rpcid) {
            case RpcTag.AddVote:
                this._addVote(message.votingid, message.targetid);
                break;
        }
    }

    private _addVote(voterid: number, targetid: number) {
        const voted = this.voted.get(targetid);
        if (voted) {
            const next = voted.indexOf(null);

            if (~next)
                voted[next] = voterid;

            if (this.room.amhost && voted.every(v => typeof v === "number")) {
                this.room.client.send({
                    op: Opcode.Reliable,
                    payloads: [
                        {
                            tag: PayloadTag.KickPlayer,
                            code: this.room.code,
                            clientid: targetid,
                            banned: false,
                            reason: 0
                        }
                    ]
                })
            }
        } else {
            this.voted.set(targetid, [voterid, null, null]);
        }
    }

    addVote(voter: PlayerDataResolvable, target: PlayerDataResolvable) {
        const voterid = this.room.resolvePlayerClientID(voter);
        const targetid = this.room.resolvePlayerClientID(target);

        this._addVote(voterid, targetid);

        this.room.client.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.AddVote,
            netid: this.netid,
            votingid: voterid,
            targetid: targetid
        });
    }
}
