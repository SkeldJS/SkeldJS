import { HazelReader, HazelWriter } from "@skeldjs/util";
import { DisconnectReason, RpcMessageTag, SpawnType } from "@skeldjs/constant";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerDataResolvable, Hostable } from "../Hostable";
import { Heritable } from "../Heritable";
import {
    AddVoteMessage,
    BaseRpcMessage,
    KickPlayerMessage,
    RpcMessage,
} from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";
import { PlayerData } from "../PlayerData";

export interface VoteBanSystemData {
    voted: Map<number, [PlayerData, PlayerData, PlayerData]>;
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
    voted: Map<number, [PlayerData|undefined, PlayerData|undefined, PlayerData|undefined]>;

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
                this.voted.set(clientid, [undefined, undefined, undefined]);
            }

            this.voted.set(clientid, [undefined, undefined, undefined]);
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
                if (voters[i]) writer.upacked(voters[i]!.id);
            }
        }
        return true;
    }

    async HandleRpc(rpc: BaseRpcMessage) {
        switch (rpc.tag) {
            case RpcMessageTag.AddVote:
                this._handleAddVote(rpc as AddVoteMessage);
                break;
        }
    }

    private _handleAddVote(rpc: AddVoteMessage) {
        const voting = this.room.players.get(rpc.votingid);
        const target = this.room.players.get(rpc.targetid);

        if (voting && target) {
            this._addVote(voting, target);
        }
    }

    private _addVote(voter: PlayerData, target: PlayerData) {
        const voted = this.voted.get(target.id);
        if (voted) {
            const next = voted.indexOf(undefined);

            if (~next) {
                voted[next] = voter;
                this.dirtyBit = 1;
            }

            if (this.room.amhost && voted.every((v) => v !== null)) {
                this.room.broadcast([], true, null, [
                    new KickPlayerMessage(
                        this.room.code,
                        target.id,
                        false,
                        DisconnectReason.None
                    ),
                ]);
            }
        } else {
            this.voted.set(target.id, [voter, undefined, undefined]);
            this.dirtyBit = 1;
        }
    }

    private _rpcAddVote(voter: PlayerData, target: PlayerData) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                new AddVoteMessage(voter.id, target.id)
            )
        );
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
        const _voter = this.room.resolvePlayer(voter);
        const _target = this.room.resolvePlayer(target);

        if (_voter && _target) {
            this._addVote(_voter, _target);
            this._rpcAddVote(_voter, _target);
        }
    }
}
