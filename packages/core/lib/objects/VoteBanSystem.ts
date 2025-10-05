import { HazelReader, HazelWriter } from "@skeldjs/util";
import { DisconnectReason, RpcMessageTag, SpawnType } from "@skeldjs/constant";

import {
    AddVoteMessage,
    BaseRpcMessage,
    KickPlayerMessage,
    RpcMessage,
} from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { NetworkedObject, NetworkedObjectEvents } from "../NetworkedObject";
import { PlayerResolvable, StatefulRoom } from "../StatefulRoom";
import { Player } from "../Player";

export type VoteBanSystemEvents<RoomType extends StatefulRoom> = NetworkedObjectEvents<RoomType> & ExtractEventTypes<[]>;

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

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    deserializeFromReader(reader: HazelReader, spawn: boolean = false) {
        const num_players = reader.upacked();

        for (let i = 0; i < num_players; i++) {
            const clientId = reader.uint32();

            if (this.voted.get(clientId)) {
                this.voted.set(clientId, [undefined, undefined, undefined]);
            }

            this.voted.set(clientId, [undefined, undefined, undefined]);
            for (let i = 0; i < 3; i++) {
                reader.upacked();
            }
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    serializeToWriter(writer: HazelWriter, spawn: boolean = false) {
        writer.upacked(this.voted.size);

        for (const [clientId, voters] of this.voted) {
            writer.uint32(clientId);

            for (let i = 0; i < 3; i++) {
                if (voters[i]) writer.upacked(voters[i]!.clientId);
            }
        }
        return true;
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {
        switch (rpc.messageTag) {
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

    private _addVote(voter: Player<RoomType>, target: Player<RoomType>) {
        const voted = this.voted.get(target.clientId);
        if (voted) {
            const next = voted.indexOf(undefined);

            if (~next) {
                voted[next] = voter;
                this.dirtyBit = 1;
            }

            if (this.room.canManageObject(this) && voted.every((v) => v !== null)) {
                this.room.broadcastImmediate([], [
                    new KickPlayerMessage(
                        this.room.code,
                        target.clientId,
                        false,
                        DisconnectReason.Error
                    ),
                ]);
            }
        } else {
            this.voted.set(target.clientId, [voter, undefined, undefined]);
            this.dirtyBit = 1;
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
    addVote(voter: PlayerResolvable, target: PlayerResolvable) {
        const _voter = this.room.resolvePlayer(voter);
        const _target = this.room.resolvePlayer(target);

        if (_voter && _target) {
            this._addVote(_voter, _target);
            this._rpcAddVote(_voter, _target);
        }
    }
}
