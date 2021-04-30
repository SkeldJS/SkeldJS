import { HazelReader, HazelWriter } from "@skeldjs/util";
import { DisconnectReason, RpcMessageTag, SpawnType } from "@skeldjs/constant";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerDataResolvable, Hostable } from "../Hostable";
import { Heritable } from "../Heritable";
import { KickPlayerMessage, RpcMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

export interface VoteBanSystemData {
    clients: Map<number, [number, number, number]>;
}

export type VoteBanSystemEvents = NetworkableEvents & ExtractEventTypes<[]>;

/**
 * Represents a room object for handling vote kicks.
 *
 * See {@link VoteBanSystemEvents} for events to listen to.
 */
export class VoteBanSystem extends Networkable<
    VoteBanSystemData,
    VoteBanSystemEvents
> {
    static type = SpawnType.GameData;
    type = SpawnType.GameData;

    static classname = "VoteBanSystem" as const;
    classname = "VoteBanSystem" as const;

    /**
     * The accumulated votes.
     */
    voted: Map<number, [number, number, number]>;

    constructor(
        room: Hostable<any>,
        netid: number,
        ownerid: number,
        data?: HazelReader | VoteBanSystemData
    ) {
        super(room, netid, ownerid, data);

        this.voted = new Map();
    }

    get owner() {
        return super.owner as Heritable;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean = false) {
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
    Serialize(writer: HazelWriter, spawn: boolean = false) {
        writer.upacked(this.voted.size);

        for (const [clientid, voters] of this.voted) {
            writer.uint32(clientid);

            for (let i = 0; i < 3; i++) {
                writer.upacked(voters[i]);
            }
        }
        return true;
    }

    async HandleRpc(callid: RpcMessageTag, reader: HazelReader) {
        switch (callid) {
            case RpcMessageTag.AddVote:
                const votingid = reader.uint32();
                const targetid = reader.uint32();
                this._addVote(votingid, targetid);
                break;
        }
    }

    private _addVote(voterid: number, targetid: number) {
        const voted = this.voted.get(targetid);
        if (voted) {
            const next = voted.indexOf(null);

            if (~next) {
                voted[next] = voterid;
                this.dirtyBit = 1;
            }

            if (this.room.amhost && voted.every((v) => v !== null)) {
                this.room.broadcast([], true, null, [
                    new KickPlayerMessage(
                        this.room.code,
                        targetid,
                        false,
                        DisconnectReason.None
                    ),
                ]);
            }
        } else {
            this.voted.set(targetid, [voterid, null, null]);
            this.dirtyBit = 1;
        }
    }

    /**
     * Add the vote of a player to vote for another player to be kicked.
     * @param voter The player to count the vote as.
     * @param target The player to vote to be kicked.
     * @example
     *```typescript
     * room.votebansystem.addVote(client.me, player);
     * ```
     */
    addVote(voter: PlayerDataResolvable, target: PlayerDataResolvable) {
        const voterid = this.room.resolvePlayerClientID(voter);
        const targetid = this.room.resolvePlayerClientID(target);

        this._addVote(voterid, targetid);

        const writer = HazelWriter.alloc(8);
        writer.uint32(voterid);
        writer.uint32(targetid);

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.AddVote, writer.buffer)
        );
    }
}
