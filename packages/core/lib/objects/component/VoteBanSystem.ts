import { HazelReader, HazelWriter } from "@skeldjs/util";
import { DisconnectReason, RpcMessageTag, SpawnType } from "@skeldjs/constant";

import {
    AddVoteMessage,
    BaseRpcMessage,
    KickPlayerMessage,
    RpcMessage,
} from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "../../Networkable";
import { PlayerDataResolvable, Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { GameData } from "../GameData";

export interface VoteBanSystemData {
    voted: Map<number, [PlayerData, PlayerData, PlayerData]>;
}

export type VoteBanSystemEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> & ExtractEventTypes<[]>;

/**
 * Represents a room object for handling vote kicks.
 *
 * See {@link VoteBanSystemEvents} for events to listen to.
 */
export class VoteBanSystem<RoomType extends Hostable = Hostable> extends Networkable<
    VoteBanSystemData,
    VoteBanSystemEvents,
    RoomType
> {
    /**
     * The accumulated votes.
     */
    voted: Map<number, [PlayerData<RoomType>|undefined, PlayerData<RoomType>|undefined, PlayerData<RoomType>|undefined]>;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | VoteBanSystemData,
        gameData?: GameData<RoomType>
    ) {
        super(room, spawnType, netId, ownerid, flags, data);

        this.voted ||= new Map;

        if (gameData) {
            this.components = gameData.components;
        }
    }

    get owner() {
        return super.owner as RoomType;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean = false) {
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
    Serialize(writer: HazelWriter, spawn: boolean = false) {
        writer.upacked(this.voted.size);

        for (const [clientId, voters] of this.voted) {
            writer.uint32(clientId);

            for (let i = 0; i < 3; i++) {
                if (voters[i]) writer.upacked(voters[i]!.clientId);
            }
        }
        return true;
    }

    async HandleRpc(rpc: BaseRpcMessage) {
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

    private _addVote(voter: PlayerData<RoomType>, target: PlayerData) {
        const voted = this.voted.get(target.clientId);
        if (voted) {
            const next = voted.indexOf(undefined);

            if (~next) {
                voted[next] = voter;
                this.dirtyBit = 1;
            }

            if (this.canBeManaged() && voted.every((v) => v !== null)) {
                this.room.broadcast([], [
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

    private _rpcAddVote(voter: PlayerData, target: PlayerData) {
        this.room.messageStream.push(
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
    addVote(voter: PlayerDataResolvable, target: PlayerDataResolvable) {
        const _voter = this.room.resolvePlayer(voter);
        const _target = this.room.resolvePlayer(target);

        if (_voter && _target) {
            this._addVote(_voter, _target);
            this._rpcAddVote(_voter, _target);
        }
    }
}
