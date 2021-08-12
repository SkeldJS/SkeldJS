import { HazelReader, HazelWriter, sleep } from "@skeldjs/util";

import { ChatNoteType, RpcMessageTag, SpawnType } from "@skeldjs/constant";

import {
    BaseRpcMessage,
    CastVoteMessage,
    ClearVoteMessage,
    CloseMessage,
    RpcMessage,
    VoteState,
    VotingCompleteMessage,
} from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerDataResolvable, Hostable } from "../Hostable";
import { PlayerVoteState, VoteStateSpecialId } from "../misc/PlayerVoteState";
import { PlayerVoteArea } from "../misc/PlayerVoteArea";

import {
    MeetingHudCloseEvent,
    MeetingHudVoteCastEvent,
    MeetingHudClearVoteEvent,
    MeetingHudVotingCompleteEvent,
} from "../events";

import { PlayerData } from "../PlayerData";
import { NetworkableConstructor } from "../Heritable";

export interface MeetingHudData {
    states: Map<number, PlayerVoteArea>;
    tie?: boolean;
    exilied?: PlayerData;
}

export type MeetingHudEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> &
    ExtractEventTypes<
        [
            MeetingHudVoteCastEvent<RoomType>,
            MeetingHudClearVoteEvent<RoomType>,
            MeetingHudVotingCompleteEvent<RoomType>,
            MeetingHudCloseEvent<RoomType>
        ]
    >;

export class MeetingHud<RoomType extends Hostable = Hostable> extends Networkable<MeetingHudData, MeetingHudEvents<RoomType>, RoomType> implements MeetingHudData {
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
    states: Map<number, PlayerVoteArea<RoomType>>;

    /**
     * Whether the vote resulted in a tie.
     */
    tie?: boolean;

    /**
     * The player that was exiled, if any.
     */
    exiled?: PlayerData<RoomType>;

    constructor(
        room: RoomType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | MeetingHudData
    ) {
        super(room, netid, ownerid, flags, data);

        this.dirtyBit ||= 0;
        this.states ||= new Map;
    }

    Awake() {
        this.states = new Map(
            [...this.room.players]
                .filter(([, player]) => player.info && player.spawned && player.playerId !== undefined)
                .map(([, player]) => {
                    return [
                        player.playerId!,
                        new PlayerVoteArea(
                            this.room,
                            player.playerId!,
                            VoteStateSpecialId.NotVoted,
                            false
                        ),
                    ];
                }));
    }

    getComponent<T extends Networkable>(
        component: NetworkableConstructor<T>
    ): T|undefined {
        if (component === MeetingHud as NetworkableConstructor<any>) {
            return this.components[0] as unknown as T;
        }
        
        return super.getComponent(component);
    }

    get owner() {
        return super.owner as RoomType;
    }

    Deserialize(reader: HazelReader, spawn: boolean = false) {
        if (spawn) {
            this.dirtyBit = 0;
            this.states = new Map;
        }

        const numVotes = reader.packed();
        for (let i = 0; i < numVotes; i++) {
            const [ playerId, mreader ] = reader.message();
            const player = this.room.getPlayerByPlayerId(playerId);

            if (!player)
                continue;

            const oldState = this.states.get(playerId);
            const newState = PlayerVoteArea.Deserialize(mreader, this.room, playerId);

            this.states.set(playerId, newState);

            if (!oldState?.votedFor && newState.hasVoted) {
                this.emit(
                    new MeetingHudVoteCastEvent(
                        this.room,
                        this,
                        undefined,
                        player,
                        newState.votedFor
                    )
                );
            } else if (oldState?.votedFor && !newState.hasVoted) {
                this.emit(
                    new MeetingHudClearVoteEvent(
                        this.room,
                        this,
                        undefined,
                        player
                    )
                );
            }
        }
    }

    Serialize(writer: HazelWriter, spawn: boolean = false) {
        writer.upacked(this.states.size);
        for (const [, state] of this.states) {
            state.Serialize(writer);
        }
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
        this.despawn();
    }

    private _rpcClose() {
        this.room.stream.push(
            new RpcMessage(this.netid, new CloseMessage)
        );
    }

    /**
     * Close the meeting hud for all clients. This is a host-only operation on
     * official servers.
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

        if (this.room.amhost && player && voter && (suspect || rpc.suspectid === 0xff)) {
            this._castVote(voter, suspect);

            const ev = await this.emit(
                new MeetingHudVoteCastEvent(
                    this.room,
                    this,
                    rpc,
                    player,
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

                if (states.every(([, state]) => state.hasVoted && !state.isDead)) {
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

    private _castVote(voting: PlayerVoteArea<RoomType>, suspect?: PlayerData<RoomType>) {
        if (suspect) {
            voting.votedForId = suspect.playerId!;
            voting.dirty = true;
        }
    }

    /**
     * Cast a vote on behalf of a user (or yourself). Casting for another player
     * other than the player calling the function is a host-only operation on
     * official servers.
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
                        player,
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

            if (voter?.hasVoted) {
                this._clearVote(voter);

                await this.emit(
                    new MeetingHudClearVoteEvent(
                        this.room,
                        this,
                        rpc,
                        voter.player!
                    )
                );
            }
        }
    }

    private _clearVote(voter: PlayerVoteArea<RoomType>) {
        if (voter.hasVoted) {
            voter.votedForId = VoteStateSpecialId.NotVoted;
            voter.dirty = true;
        }
    }

    private async _rpcClearVote(voter: PlayerVoteArea<RoomType>) {
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
     * This is a host-only operation on official servers.
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
                        _voter.player!
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

        const playerStates = rpc.states.map((state, i) => {
            return new PlayerVoteState(this.room, state.playerId, state.votedForId);
        });

        this._votingComplete(playerStates, rpc.tie, exiled);

        await this.emit(
            new MeetingHudVotingCompleteEvent(
                this.room,
                this,
                rpc,
                rpc.tie,
                new Map(playerStates.map(state => [ state.playerId, state ])),
                exiled
            )
        );
    }

    private _votingComplete(
        states: PlayerVoteState<RoomType>[],
        tie: boolean,
        exiled?: PlayerData<RoomType>
    ) {
        for (let i = 0; i < states.length; i++) {
            const state = this.states.get(i);
            if (state) {
                state.votedForId = states[i].votedForId;
            }
        }
        this.tie = tie;
        this.exiled = exiled;
    }

    private _rpcVotingComplete(
        states: PlayerVoteState<RoomType>[],
        tie: boolean,
        exiled?: PlayerData<RoomType>
    ) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                new VotingCompleteMessage(
                    states.map(state => new VoteState(state.playerId, state.votedForId)), exiled ? exiled.playerId ?? 0 : 0, tie)
            )
        );
    }

    /**
     * End the meeting with specified results. This is a host-only operation
     * on official servers.
     * @param tie Whether this meeting resulted in a tie of votes.
     * @param exiled The player that was ejected, if any.
     */
    votingComplete(tie: boolean = false, exiled?: PlayerDataResolvable) {
        const _exiled = exiled ? this.room.resolvePlayer(exiled) : undefined;

        const voteStates: PlayerVoteState<RoomType>[] = new Array(this.room.players.size);
        for (const [ playerId, state ] of this.states) {
            voteStates[playerId] = new PlayerVoteState(this.room, playerId, state.votedForId);
        }

        this._votingComplete(voteStates, tie, _exiled);
        this._rpcVotingComplete(voteStates, tie, _exiled);

        this.emit(
            new MeetingHudVotingCompleteEvent(
                this.room,
                this,
                undefined,
                tie,
                new Map(voteStates.map(vote =>
                    [ vote.playerId, vote ])),
                _exiled
            )
        );
    }
}
