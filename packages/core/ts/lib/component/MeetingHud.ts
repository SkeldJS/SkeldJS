import { HazelBuffer } from "@skeldjs/util"

import {
    ChatNoteType,
    MessageTag,
    Opcode,
    PayloadTag,
    RpcTag,
    SpawnID,
    VoteState
} from "@skeldjs/constant";

import {
    RpcMessage
} from "@skeldjs/protocol"

import { Networkable } from "../Networkable";
import { Global } from "../Global";
import { PlayerDataResolvable, Room } from "../Room";
import { PlayerVoteState } from "../misc/PlayerVoteState";
import { PlayerData } from "../PlayerData";

export interface MeetingHudData {
    dirtyBit: number;
    players: Map<number, PlayerVoteState>;
}

export type MeetingHudEvents = {
    voteCast: (voter: PlayerData, suspect: "skip"|PlayerData) => void;
    voteCleared: (player: PlayerData) => void;
    votingComplete: (tie: boolean, playerExiled: PlayerData, voteStates: PlayerVoteState[]) => void;
}

export class MeetingHud extends Networkable<MeetingHudEvents> {
    static type = SpawnID.MeetingHud as const;
    type = SpawnID.MeetingHud as const;

    static classname = "MeetingHud" as const;
    classname = "MeetingHud" as const;

    dirtyBit: number;
    players: Map<number, PlayerVoteState>;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|MeetingHudData) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as Global;
    }

    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        if (spawn) {
            this.dirtyBit = 0;
            this.players = new Map;

            for (let i = 0; i < this.players.size; i++) {
                this.players.set(i, new PlayerVoteState(this.room, i, reader.byte()));
            }
        } else {
            const mask = reader.upacked();

            for (let i = 0; i < this.players.size; i++) {
                if (mask & (1 << i)) {
                    this.players.set(i, new PlayerVoteState(this.room, i, reader.byte()));
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
            case RpcTag.VotingComplete:
                this._completeVoting(message.states, message.exiled, message.tie);
                break;
            case RpcTag.CastVote:
                this._castVote(message.votingid, message.suspectid);
                break;
            case RpcTag.ClearVote:
                this._clearVote(this.room.me.playerId);
                break;
        }
    }

    FixedUpdate() {
        if (this.dirtyBit) {
            const players = [...this.players.entries()].filter(([ playerId ]) => {
                return (1 << playerId) & this.dirtyBit;
            });

            if (players.length) {
                const writer = HazelBuffer.alloc(1 + players.length);

                this.Serialize(writer);

                this.room.client.stream.push({
                    tag: MessageTag.Data,
                    netid: this.netid,
                    data: writer
                });
            }
        }

        this.dirtyBit = 0;
    }

    private _castVote(votingid: number, suspectid: number) {
        const voting = this.players.get(votingid);

        const resolved_suspect = this.room.getPlayerByPlayerId(suspectid);

        if (voting && (resolved_suspect || suspectid === 0xFF)) {
            if (suspectid !== 0xFF)
                voting.state |= (suspectid & VoteState.VotedFor) + 1;

            voting.state |= VoteState.DidVote;
            this.dirtyBit |= (1 << votingid);

            if (this.room.amhost) {
                this.room.host.control.sendChatNote(ChatNoteType.DidVote);
            }

            this.emit("voteCast", voting, resolved_suspect || "skip");
        }
    }

    private _clearVote(voterid: number) {
        const voting = this.players.get(voterid);
        const resolved = this.room.getPlayerByPlayerId(voterid);

        if (voting) {
            voting.state ^= 0xF;
            voting.state ^= VoteState.DidVote;
            this.dirtyBit |= (1 << voterid);

            this.emit("voteCleared", resolved);
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
                            tag: MessageTag.RPC,
                            rpcid: RpcTag.ClearVote,
                            netid: this.netid
                        }
                    ]
                }
            ]
        })
    }

    async castVote(voting: PlayerDataResolvable, suspect: PlayerDataResolvable|"skip") {
        const votingid = this.room.resolvePlayer(voting).playerId;
        const suspectid = suspect === "skip" ? 0xFF : this.room.resolvePlayer(suspect).playerId;

        this._castVote(votingid, suspectid);

        if (!this.room.amhost) {
            await this.room.client.send({
                op: Opcode.Reliable,
                payloads: [
                    {
                        tag: PayloadTag.GameDataTo,
                        code: this.room.code,
                        recipientid: this.room.hostid,
                        messages: [
                            {
                                tag: MessageTag.RPC,
                                rpcid: RpcTag.CastVote,
                                netid: this.netid,
                                votingid,
                                suspectid
                            }
                        ]
                    }
                ]
            });
        }
    }

    private _completeVoting(states: number[], exiled: number, tie: boolean) {
        const resolved = tie || exiled === 0xFF ? null : this.room.getPlayerByPlayerId(exiled);
        const votes = new Map(states.map((state, i) => [ i, new PlayerVoteState(this.room, i, state) ]));

        this.emit("votingComplete", tie, resolved, votes);
    }
}
