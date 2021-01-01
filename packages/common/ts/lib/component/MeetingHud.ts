import { HazelBuffer } from "@skeldjs/util"
import { MessageID, Opcode, PayloadTag, RpcID, SpawnID } from "@skeldjs/constant";

import {
    VoteState,
    PlayerVoteState
} from "@skeldjs/types"

import { Networkable } from "../Networkable";
import { Global } from "../Global";
import { PlayerDataResolvable, Room } from "../Room";
import { PlayerData } from "../PlayerData";
import { RpcMessage } from "packages/protocol/js";

export interface MeetingHudData {
    dirtyBit: number;
    players: Map<number, PlayerVoteState>;
}

export class MeetingHud extends Networkable<Global> {
    static type = SpawnID.MeetingHud as const;
    type = SpawnID.MeetingHud as const;

    static classname = "MeetingHud" as const;
    classname = "MeetingHud" as const;
    
    dirtyBit: number;
    players: Map<number, PlayerVoteState>;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|MeetingHudData) {
        super(room, netid, ownerid, data);
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            this.dirtyBit = 0;
            this.players = new Map;

            for (let i = 0; i < this.players.size; i++) {
                this.players.set(i, MeetingHud.readPlayerState(reader));
            }
        } else {
            const mask = reader.upacked();

            for (let i = 0; i < this.players.size; i++) {
                if (mask & (1 << i)) {
                    this.players.set(i, MeetingHud.readPlayerState(reader));
                }
            }
        }
    }

    Serialize(writer: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            for (const [ , player ] of this.players) {
                writer.upacked(player.state);
            }
        } else {
            writer.upacked(this.dirtyBit);

            for (const [ playerId, player ] of this.players) {
                if (this.dirtyBit & (1 << playerId)) {
                    writer.upacked(player.state);
                }
            }
        }
    }

    HandleRPC(message: RpcMessage) {
        switch (message.rpcid) {
            case RpcID.CastVote:
                this._castVote(message.votingid, message.suspectid);
                break;
            case RpcID.ClearVote:
                this._clearVote(this.room.me.playerId);
                break;
        }
    }

    private _castVote(votingid: number, suspectid: number) {
        const voting = this.players.get(votingid);

        if (voting) {
            if (suspectid !== 0xFF)
                voting.state |= suspectid & VoteState.VotedFor;

            voting.state |= VoteState.DidVote;
        }
    }

    private _clearVote(votingid: number) {
        const voting = this.players.get(votingid);

        if (voting) {
            voting.state ^= 0xF;
            voting.state ^= VoteState.DidVote;
        }
    }

    async clearVote(voter: PlayerDataResolvable) {
        const voterid = this.room.resolvePlayerClientID(voter);

        await this.room.client.send({
            op: Opcode.Reliable,
            payloads: [
                {
                    tag: PayloadTag.GameDataTo,
                    code: this.room.code,
                    recipientid: voterid,
                    messages: [
                        {
                            tag: MessageID.RPC,
                            rpcid: RpcID.ClearVote,
                            netid: this.netid
                        }
                    ]
                }
            ]
        })
    }

    castVote(voting: PlayerDataResolvable, suspect: PlayerDataResolvable|"skip") {
        const votingid = this.room.resolvePlayer(voting).playerId;
        const suspectid = suspect === "skip" ? 0xFF : this.room.resolvePlayer(suspect).playerId;

        this._castVote(votingid, suspectid);

        this.room.client.stream.push({
            tag: MessageID.RPC,
            rpcid: RpcID.CastVote,
            netid: this.netid,
            votingid: votingid,
            suspectid: suspectid
        });
    }

    static readPlayerState(reader: HazelBuffer): PlayerVoteState {
        return {
            state: reader.byte(),
            get voted() {
                return (this.state & VoteState.VotedFor) - 1
            }
        }
    }
}