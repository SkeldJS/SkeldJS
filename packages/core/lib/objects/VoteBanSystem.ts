import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { DisconnectReason, RpcMessageTag, SpawnType } from "@skeldjs/constant";

import {
    AddVoteMessage,
    BanVotesDataMessage,
    BaseDataMessage,
    BaseRpcMessage,
    KickPlayerMessage,
    RpcMessage,
    VoteBanSystemDataMessage,
} from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { DataState, NetworkedObject, NetworkedObjectEvents } from "../NetworkedObject";
import { PlayerResolvable, StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";

export type VoteBanSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a room object for handling vote kicks.
 *
 * See {@link VoteBanSystemEvents} for events to listen to.
 */
export class VoteBanSystem<RoomType extends StatefulRoom> extends NetworkedObject<RoomType, VoteBanSystemEvents<RoomType>> {
    /**
     * The accumulated votes.
     */
    voted: Map<number, [Player<RoomType> | undefined, Player<RoomType> | undefined, Player<RoomType> | undefined]>;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
    ) {
        super(room, spawnType, netId, ownerId, flags);

        this.voted = new Map;
    }

    get owner() {
        return super.owner as RoomType;
    }
    
    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }

    async processAwake(): Promise<void> {
        void 0;
    }

    parseData(state: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (state) {
        case DataState.Spawn:
        case DataState.Update: return VoteBanSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof VoteBanSystemDataMessage) {
            for (const banVotes of data.banVotes) {
                this.voted.set(banVotes.targetClientId, [
                    this.room.players.get(banVotes.voterClientIds[0]),
                    this.room.players.get(banVotes.voterClientIds[1]),
                    this.room.players.get(banVotes.voterClientIds[2]),
                ]);
            }
        }
    }

    createData(state: DataState): BaseDataMessage | undefined {
        switch (state) {
        case DataState.Spawn:
        case DataState.Update:
            const banVotes = [];
            for (const [ clientId, voters ] of this.voted) {
                banVotes.push(new BanVotesDataMessage(clientId,
                    [ voters[0]?.clientId || 0, voters[1]?.clientId || 0, voters[2]?.clientId || 0 ]));
            }
            return new VoteBanSystemDataMessage(banVotes);
        }
        return undefined;
    }

    parseRemoteCall(rpcTag: RpcMessageTag, reader: HazelReader): BaseRpcMessage | undefined {
        switch (rpcTag) {
            case RpcMessageTag.AddVote: return AddVoteMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {
        if (rpc instanceof AddVoteMessage) return await this._handleAddVote(rpc);
    }

    private async _handleAddVote(rpc: AddVoteMessage) {
        const voting = this.room.players.get(rpc.votingId);
        const target = this.room.players.get(rpc.targetId);

        if (voting && target) {
            await this._addVote(voting, target);
        }
    }

    private async _addVote(voter: Player<RoomType>, target: Player<RoomType>) {
        const voted = this.voted.get(target.clientId);
        if (voted) {
            const next = voted.indexOf(undefined);

            if (~next) {
                voted[next] = voter;
                this.pushDataState(DataState.Update);
            }

            if (this.room.canManageObject(this) && voted.every((v) => v !== null)) {
                await this.room.playerVoteKicked(target);
            }
        } else {
            this.voted.set(target.clientId, [voter, undefined, undefined]);
            this.pushDataState(DataState.Update);
        }
    }

    private _rpcAddVote(voter: Player<RoomType>, target: Player<RoomType>) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new AddVoteMessage(voter.clientId, target.clientId)
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
    async addVote(voter: PlayerResolvable, target: PlayerResolvable) {
        const _voter = this.room.resolvePlayer(voter);
        const _target = this.room.resolvePlayer(target);

        if (_voter && _target) {
            await this._addVote(_voter, _target);
            this._rpcAddVote(_voter, _target);
        }
    }
}
