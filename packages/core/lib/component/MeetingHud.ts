import { HazelReader, HazelWriter, sleep } from "@skeldjs/util";

import { ChatNoteType, RpcMessageTag, SpawnType } from "@skeldjs/constant";

import {
    BaseRpcMessage,
    CastVoteMessage,
    ClearVoteMessage,
    CloseMessage,
    RpcMessage,
    VotingCompleteMessage,
} from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerDataResolvable, Hostable } from "../Hostable";
import { PlayerVoteState } from "../misc/PlayerVoteState";
import { Heritable } from "../Heritable";

import {
    MeetingHudCloseEvent,
    MeetingHudVoteCastEvent,
    MeetingHudClearVoteEvent,
    MeetingHudVotingCompleteEvent,
} from "../events";
import { PlayerData } from "../PlayerData";

export interface MeetingHudData {
    states: Map<number, PlayerVoteState>;
    tie?: boolean;
    exilied?: PlayerData;
}

export type MeetingHudEvents = NetworkableEvents &
    ExtractEventTypes<
        [
            MeetingHudVoteCastEvent,
            MeetingHudClearVoteEvent,
            MeetingHudVotingCompleteEvent,
            MeetingHudCloseEvent
        ]
    >;

export class MeetingHud extends Networkable<MeetingHudData, MeetingHudEvents> implements MeetingHudData {
    static type = SpawnType.MeetingHud as const;
    type = SpawnType.MeetingHud as const;

    static classname = "MeetingHud" as const;
    classname = "MeetingHud" as const;

    /**
     * The dirty vote states to be updated on the next fixed update.
     */
    dirtyBit: number;

    /**
     * The vote states in the meeting hud.
     */
    states: Map<number, PlayerVoteState>;

    /**
     * Whether the vote resulted in a tie.
     */
    tie?: boolean;

    /**
     * The player that was exiled, if any.
     */
    exiled?: PlayerData;

    constructor(
        room: Hostable<any>,
        netid: number,
        ownerid: number,
        data?: HazelReader | MeetingHudData
    ) {
        super(room, netid, ownerid, data);

        this.dirtyBit ||= 0;
        this.states ||= new Map;
    }

    get owner() {
        return super.owner as Heritable;
    }

    Deserialize(reader: HazelReader, spawn: boolean = false) {
        if (spawn) {
            this.dirtyBit = 0;
            this.states = new Map;

            for (let i = 0; i < this.states.size; i++) {
                this.states.set(
                    i,
                    PlayerVoteState.Deserialize(reader, this.room, i)
                );
            }
        } else {
            const mask = reader.upacked();

            for (let i = 0; i < this.states.size; i++) {
                if (mask & (1 << i)) {
                    this.states.set(
                        i,
                        PlayerVoteState.Deserialize(reader, this.room, i)
                    );
                }
            }
        }
    }

    Serialize(writer: HazelWriter, spawn: boolean = false) {
        if (spawn) {
            for (const [, state] of this.states) {
                state.Serialize(writer);
            }
        } else {
            writer.upacked(this.dirtyBit);

            for (const [playerId, state] of this.states) {
                if (this.dirtyBit & (1 << playerId)) {
                    state.Serialize(writer);
                }
            }
        }
        this.dirtyBit = 0;
        return true;
    }

    async HandleRpc(rpc: BaseRpcMessage) {
        switch (rpc.tag) {
            case RpcMessageTag.Close:
                await this._handleClose(rpc as CloseMessage);
                break;
            case RpcMessageTag.VotingComplete:
                await this._handleVotingComplete(rpc as VotingCompleteMessage);
                break;
            case RpcMessageTag.CastVote:
                await this._handleCastVote(rpc as CastVoteMessage);
                break;
            case RpcMessageTag.ClearVote:
                await this._handleClearVote(rpc as ClearVoteMessage);
                break;
        }
    }

    private async _handleClose(rpc: CloseMessage) {
        await this.emit(
            new MeetingHudCloseEvent(
                this.room,
                this,
                rpc
            )
        );
    }

    private _close() {
        this.room.netobjects.delete(this.netid);
        this.room.components.splice(
            this.room.components.indexOf(this),
            1,
            null
        );
    }

    private _rpcClose() {
        this.room.stream.push(
            new RpcMessage(this.netid, new CloseMessage)
        );
    }

    /**
     * Close the meeting hud for all clients.
     */
    close() {
        this._close();
        this._rpcClose();
    }

    private async _handleCastVote(rpc: CastVoteMessage) {
        const voter = this.states.get(rpc.votingid);
        const player = this.room.getPlayerByPlayerId(rpc.votingid);
        const suspect =
            rpc.suspectid === 0xff
                ? undefined
                : this.room.getPlayerByPlayerId(rpc.suspectid);

        if (player && voter && (suspect || rpc.suspectid === 0xff)) {
            this._castVote(voter, suspect);

            const ev = await this.emit(
                new MeetingHudVoteCastEvent(
                    this.room,
                    this,
                    rpc,
                    voter,
                    suspect
                )
            );

            if (ev.reverted) {
                if (player) {
                    await this.clearVote(player);
                }
            } else {
                this.room.me?.control?.sendChatNote(
                    player,
                    ChatNoteType.DidVote
                );

                const states = [...this.states];

                if (states.every(([, state]) => state.voted && !state.dead)) {
                    let tie = false;
                    let exiled: PlayerData|undefined;
                    let exiled_votes = 0;
                    for (const [, state] of states) {
                        let num = 0;
                        for (const [, state2] of states) {
                            if (state2.votedFor === state.player) {
                                num++;
                            }
                        }
                        if (num) {
                            if (num > exiled_votes) {
                                tie = false;
                                exiled = state.player;
                                exiled_votes = num;
                            } else if (num === exiled_votes) {
                                tie = true;
                            }
                        }
                    }

                    this.votingComplete(tie, exiled);
                    sleep(5000).then(() => {
                        this.close();
                    });
                }
            }
        }
    }

    private _castVote(voting: PlayerVoteState, suspect?: PlayerData) {
        if (suspect) voting.votedFor = suspect;

        voting.voted = true;
        this.dirtyBit |= 1 << voting.playerId;
    }

    /**
     * Cast a vote on behalf of a user (or yourself).
     * @param voting The player who is voting.
     * @param suspect The player to vote for.
     * @example
     *```typescript
     * // Make everyone vote a certain player.
     * for ([ clientid, player ] of room.players) {
     *   if (player !== suspect) {
     *     room.meetinghud.castVote(player, suspect);
     *   }
     * }
     * ```
     */
    async castVote(
        voting: PlayerDataResolvable,
        suspect: PlayerDataResolvable | "skip"
    ) {
        const player = this.room.resolvePlayer(voting);

        const _suspect =
            suspect === "skip" ? undefined : this.room.resolvePlayer(suspect);

        if (player && player.playerId !== undefined) {
            const votingState = this.states.get(player.playerId);

            if (votingState && _suspect) {
                this._castVote(votingState, _suspect);

                await this.emit(
                    new MeetingHudVoteCastEvent(
                        this.room,
                        this,
                        undefined,
                        votingState,
                        _suspect
                    )
                );

                this.room.me?.control?.sendChatNote(
                    player,
                    ChatNoteType.DidVote
                );
            }
        }
    }

    private async _handleClearVote(rpc: ClearVoteMessage) {
        void rpc;

        const player = this.room.me;

        if (player && player.playerId !== undefined) {
            const voter = this.states.get(player.playerId);

            if (voter?.voted) {
                this._clearVote(voter);

                await this.emit(
                    new MeetingHudClearVoteEvent(
                        this.room,
                        this,
                        rpc,
                        voter
                    )
                );
            }
        }
    }

    private _clearVote(voter: PlayerVoteState) {
        if (voter.voted) {
            voter.votedFor = undefined;
            voter.voted = false;
            this.dirtyBit |= 1 << voter.playerId;
        }
    }

    private async _rpcClearVote(voter: PlayerVoteState) {
        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    new ClearVoteMessage
                ),
            ],
            true,
            this.room.getPlayerByPlayerId(voter.playerId)
        );
    }

    /**
     * Remove someone's vote (usually due to the player they voted for getting disconnected).
     * @param resolvable The player to remove the vote of.
     */
    async clearVote(voter: PlayerDataResolvable) {
        const player = this.room.resolvePlayer(voter);

        if (player && player.playerId !== undefined) {
            const _voter = this.states.get(player.playerId);

            if (_voter) {
                this._clearVote(_voter);
                await this.emit(
                    new MeetingHudClearVoteEvent(
                        this.room,
                        this,
                        undefined,
                        _voter
                    )
                );
                await this._rpcClearVote(_voter);
            }
        }
    }

    private async _handleVotingComplete(rpc: VotingCompleteMessage) {
        const exiled =
            rpc.exiledid === 0xff
                ? undefined
                : this.room.getPlayerByPlayerId(rpc.exiledid);

        this._votingComplete(rpc.states, rpc.tie, exiled);

        await this.emit(
            new MeetingHudVotingCompleteEvent(
                this.room,
                this,
                rpc,
                rpc.tie,
                new Map(
                    rpc.states.map((state, i) => [
                        i,
                        PlayerVoteState.from(this.room, i, state),
                    ])
                ),
                exiled
            )
        );
    }

    private _votingComplete(
        states: number[],
        tie: boolean,
        exiled?: PlayerData
    ) {
        for (let i = 0; i < states.length; i++) {
            const state = this.states.get(i);
            if (state) {
                state.patch(states[i]);
            }
        }
        this.tie = tie;
        this.exiled = exiled;
    }

    private _rpcVotingComplete(
        states: number[],
        tie: boolean,
        exiled?: PlayerData
    ) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                new VotingCompleteMessage(states, exiled ? exiled.playerId ?? 0 : 0, tie)
            )
        );
    }

    votingComplete(tie: boolean, exiled?: PlayerDataResolvable) {
        const _exiled = exiled ? this.room.resolvePlayer(exiled) : undefined;

        const voteStates: number[] = new Array(this.room.players.size);
        for (const [ playerid, state ] of this.states) {
            voteStates[playerid] = state.byte;
        }

        this._votingComplete(voteStates, tie, _exiled);
        this._rpcVotingComplete(voteStates, tie, _exiled);

        this.emit(
            new MeetingHudVotingCompleteEvent(
                this.room,
                this,
                undefined,
                tie,
                this.states,
                _exiled
            )
        );
    }
}
