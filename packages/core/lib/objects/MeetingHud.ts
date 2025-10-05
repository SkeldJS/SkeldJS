import { HazelReader, HazelWriter, sleep } from "@skeldjs/util";

import { ChatNoteType, GameOverReason, RpcMessageTag, SpawnType } from "@skeldjs/constant";

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

import { NetworkedObject, NetworkedObjectEvents, NetworkedObjectConstructor } from "../NetworkedObject";
import { PlayerResolvable, StatefulRoom } from "../StatefulRoom";
import { PlayerVoteState, VoteStateSpecialId } from "../misc/PlayerVoteState";
import { PlayerVoteArea } from "../misc/PlayerVoteArea";

import {
    MeetingHudCloseEvent,
    MeetingHudVoteCastEvent,
    MeetingHudClearVoteEvent,
    MeetingHudVotingCompleteEvent,
} from "../events";

import { Player } from "../Player";
import { AmongUsEndGames, EndGameIntent, PlayersVoteOutEndgameMetadata } from "../endgame";

export type MeetingHudEvents<RoomType extends StatefulRoom> = NetworkedObjectEvents<RoomType> &
    ExtractEventTypes<
        [
            MeetingHudVoteCastEvent<RoomType>,
            MeetingHudClearVoteEvent<RoomType>,
            MeetingHudVotingCompleteEvent<RoomType>,
            MeetingHudCloseEvent<RoomType>
        ]
    >;

export class MeetingHud<RoomType extends StatefulRoom> extends NetworkedObject<RoomType, MeetingHudEvents<RoomType>> {
    /**
     * The dirty vote states to be updated on the next fixed update.
     */
    dirtyBit: number = 0;

    /**
     * The vote states in the meeting hud.
     */
    voteStates: Map<number, PlayerVoteArea<RoomType>> = new Map;

    /**
     * Whether the vote resulted in a tie.
     */
    tie?: boolean;

    /**
     * The player that was exiled, if any.
     */
    exiled?: Player<RoomType>;

    ranOutOfTimeTimeout?: NodeJS.Timeout;

    processAwake() {
        this.voteStates = new Map(
            [...this.room.playerInfo]
                .filter(([, player]) => player.playerId !== undefined)
                .map(([, player]) => {
                    return [
                        player.playerId,
                        new PlayerVoteArea(
                            this,
                            player.playerId,
                            VoteStateSpecialId.NotVoted,
                            false
                        ),
                    ];
                }));

        if (this.room.settings.votingTime > 0) {
            this.ranOutOfTimeTimeout = setTimeout(() => {
                for (const [, voteState] of this.voteStates) {
                    if (voteState.votedForId === 255) {
                        voteState.setMissed();
                    }
                }

                this.checkForVoteComplete(true);
            }, 8000 + this.room.settings.discussionTime * 1000 + this.room.settings.votingTime * 1000);
        }
    }

    get owner() {
        return super.owner as RoomType;
    }

    deserializeFromReader(reader: HazelReader, spawn: boolean = false) {
        if (spawn) {
            this.dirtyBit = 0;
            this.voteStates = new Map;
        }

        const numVotes = reader.packed();
        for (let i = 0; i < numVotes; i++) {
            const [playerId, mreader] = reader.message();
            const player = this.room.getPlayerByPlayerId(playerId);

            if (!player)
                continue;

            const oldState = this.voteStates.get(playerId);
            const newState = PlayerVoteArea.deserializeFromReader(mreader, this, playerId);

            this.voteStates.set(playerId, newState);

            if (!oldState?.hasVoted && newState.hasVoted) {
                this.emitSync(
                    new MeetingHudVoteCastEvent(
                        this.room,
                        this,
                        undefined,
                        player,
                        newState.votedFor
                    )
                );
            } else if (oldState?.votedFor && !newState.hasVoted) {
                this.emitSync(
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

    serializeToWriter(writer: HazelWriter, spawn: boolean = false) {
        writer.upacked(this.voteStates.size);
        for (const [, state] of this.voteStates) {
            writer.begin(state.playerId);
            state.serializeToWriter(writer);
            writer.end();
        }
        this.dirtyBit = 0;
        return true;
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {
        switch (rpc.messageTag) {
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

    private async _close() {
        this.room["_despawnComponent"](this);
        if (this.room.shipStatus) {
            for (const [, player] of this.room.players) {
                await this.room.shipStatus.spawnPlayer(player, true, true);
            }
        }
    }

    private _rpcClose() {
        this.room.messageStream.push(
            new RpcMessage(this.netId, new CloseMessage)
        );
    }

    /**
     * Close the meeting hud for all clients. This is a host-only operation on
     * official servers.
     */
    async close() {
        await this._close();
        this._rpcClose();
    }

    checkForVoteComplete(isTimeout: boolean) {
        const states = [...this.voteStates];

        if (states.every(([, state]) => state.hasVoted || !state.canVote) || isTimeout) {
            let tie = false;
            let exiled: Player<RoomType> | undefined;
            let exiledVotes = 0;
            let numSkips = 0;
            for (const [, state2] of states) {
                if (state2.votedForId === VoteStateSpecialId.SkippedVote) {
                    numSkips++;
                }
            }
            for (const [, state] of states) {
                let num = 0;
                for (const [, state2] of states) {
                    if (state2.votedForId === state.playerId) {
                        num++;
                    }
                }
                if (num) {
                    if (num > exiledVotes) {
                        tie = false;
                        exiled = state.player;
                        exiledVotes = num;
                    } else if (num === exiledVotes) {
                        tie = true;
                        exiled = undefined;
                    }
                }
            }

            if (numSkips >= exiledVotes)
                exiled = undefined;

            this.votingComplete(tie, exiled);
        }
    }

    private async _handleCastVote(rpc: CastVoteMessage) {
        const voter = this.voteStates.get(rpc.votingid);
        const player = this.room.getPlayerByPlayerId(rpc.votingid);
        const suspect =
            rpc.suspectid === VoteStateSpecialId.SkippedVote
                ? undefined
                : this.room.getPlayerByPlayerId(rpc.suspectid);

        if (this.room.canManageObject(this) && player && voter && (suspect || rpc.suspectid === VoteStateSpecialId.SkippedVote)) {
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
                    await this.clearVoteBroadcast(player);
                }
            } else {
                this.room.playerAuthority?.characterControl?.sendChatNote(
                    player,
                    ChatNoteType.DidVote
                );

                this.checkForVoteComplete(false);
            }
        }
    }

    private _castVote(voterState: PlayerVoteArea<RoomType>, suspect?: Player<RoomType>) {
        if (voterState) {
            if (suspect) {
                voterState.setSuspect(suspect.getPlayerId()!);
            } else {
                voterState.setSkipped();
            }
        }
    }

    private async _rpcCastVote(voter: Player<RoomType>, suspect: Player<RoomType> | undefined) {
        await this.room.broadcast([
            new RpcMessage(
                this.netId,
                new CastVoteMessage(
                    voter.getPlayerId()!,
                    suspect
                        ? suspect.getPlayerId()!
                        : 255
                )
            )
        ], undefined, [this.room.authorityId]);
    }

    /**
     * Cast a vote on behalf of a user (or yourself). Casting for another player
     * other than the player calling the function is a host-only operation on
     * official servers.
     * @param voter The player who is voting.
     * @param suspect The player to vote for.
     * @example
     *```typescript
     * // Make everyone vote a certain player.
     * for ([ clientId, player ] of room.players) {
     *   if (player !== suspect) {
     *     room.meetinghud.castVote(player, suspect);
     *   }
     * }
     * ```
     */
    async castVote(
        voter: PlayerResolvable,
        suspect: PlayerResolvable | "skip"
    ) {
        const player = this.room.resolvePlayer(voter);

        const _suspect =
            suspect === "skip" ? undefined : this.room.resolvePlayer(suspect);

        if (player && player.getPlayerId() !== undefined) {
            const votingState = this.voteStates.get(player.getPlayerId()!);

            if (votingState) {
                if (this.room.canManageObject(this)) {
                    this._castVote(votingState, _suspect);

                    const ev = await this.emit(
                        new MeetingHudVoteCastEvent(
                            this.room,
                            this,
                            undefined,
                            player,
                            _suspect
                        )
                    );

                    if (ev.reverted) {
                        this._clearVote(votingState);
                    } else {
                        this.room.playerAuthority?.characterControl?.sendChatNote(
                            player,
                            ChatNoteType.DidVote
                        );

                        this.checkForVoteComplete(false);
                    }
                } else {
                    await this._rpcCastVote(player, _suspect);
                }
            }
        }
    }

    private async _handleClearVote(rpc: ClearVoteMessage) {
        void rpc;

        await this.room.clearMyVote(this);


    }

    private _clearVote(voter: PlayerVoteArea<RoomType>) {
        if (voter.hasVoted) {
            voter.clearVote();
            voter.dirty = true;
        }
    }

    private async _rpcClearVote(voter: Player<RoomType>) {
        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netId,
                    new ClearVoteMessage
                ),
            ],
            undefined,
            [voter]
        );
    }

    async setVoteCleared(player: Player<RoomType>) {
        const _voter = this.voteStates.get(player.getPlayerId()!);

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
        }
    }

    /**
     * Remove someone's vote (usually due to the player they voted for getting disconnected).
     * This is a host-only operation on official servers.
     * @param resolvable The player to remove the vote of.
     */
    async clearVoteBroadcast(voter: PlayerResolvable) {
        const player = this.room.resolvePlayer(voter);

        if (player && player.getPlayerId() !== undefined) {
            const clearedVote = await this.setVoteCleared(player);
            await this._rpcClearVote(player);
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

        this._populateStates(playerStates);
        await this._votingComplete(rpc.tie, exiled);

        await this.emit(
            new MeetingHudVotingCompleteEvent(
                this.room,
                this,
                rpc,
                rpc.tie,
                new Map(playerStates.map(state => [state.playerId, state])),
                exiled
            )
        );
    }

    protected _populateStates(states: PlayerVoteState<RoomType>[]) {
        for (let i = 0; i < states.length; i++) {
            const state = this.voteStates.get(i);
            if (state) {
                state.votedForId = states[i].votedForId;
            }
        }
    }

    protected async _votingComplete(
        tie: boolean,
        exiled?: Player<RoomType>
    ) {
        this.tie = tie;
        this.exiled = exiled;

        if (this.room.canManageObject(this)) {
            await sleep(5000);
            await exiled?.characterControl?.kill("exiled");
            this.close();
            await sleep(5000);

            if (exiled) {
                let aliveCrewmates = 0;
                let aliveImpostors = 0;
                for (const [, playerInfo] of this.room.playerInfo) {
                    if (!playerInfo.isDisconnected && !playerInfo.isDead) {
                        if (playerInfo.isImpostor) {
                            aliveImpostors++;
                        } else {
                            aliveCrewmates++;
                        }
                    }
                }

                if (exiled.getPlayerInfo()?.isImpostor) {
                    if (aliveImpostors <= 0) {
                        this.room.registerEndGameIntent(
                            new EndGameIntent<PlayersVoteOutEndgameMetadata<RoomType>>(
                                AmongUsEndGames.PlayersVoteOut,
                                GameOverReason.HumansByVote,
                                {
                                    exiled,
                                    aliveCrewmates,
                                    aliveImpostors
                                }
                            )
                        );
                    }
                } else {
                    if (aliveCrewmates <= aliveImpostors) {
                        this.room.registerEndGameIntent(
                            new EndGameIntent<PlayersVoteOutEndgameMetadata<RoomType>>(
                                AmongUsEndGames.PlayersVoteOut,
                                GameOverReason.ImpostorByVote,
                                {
                                    exiled,
                                    aliveCrewmates,
                                    aliveImpostors
                                }
                            )
                        );
                    }
                }
            }
        }

        if (this.ranOutOfTimeTimeout)
            clearInterval(this.ranOutOfTimeTimeout);
    }

    protected _rpcVotingComplete(
        states: PlayerVoteState<RoomType>[],
        tie: boolean,
        exiled?: Player<RoomType>
    ) {
        this.room.messageStream.push(
            new RpcMessage(
                this.netId,
                new VotingCompleteMessage(
                    states.map(state => new VoteState(state.playerId, state.votedForId)), exiled ? exiled.getPlayerId() ?? 0xff : 0xff, tie)
            )
        );
    }

    /**
     * End the meeting with specified results. This is a host-only operation
     * on official servers.
     * @param tie Whether this meeting resulted in a tie of votes.
     * @param exiled The player that was ejected, if any.
     */
    async votingComplete(tie: boolean = false, exiled?: PlayerResolvable) {
        const _exiled = exiled ? this.room.resolvePlayer(exiled) : undefined;

        const voteStates: PlayerVoteState<RoomType>[] = new Array(this.room.playerInfo.size);
        let i = 0;
        for (const [playerId, state] of this.voteStates) {
            voteStates[i] = new PlayerVoteState(this.room, playerId, state.votedForId);
            i++;
        }

        this._populateStates(voteStates);
        this._rpcVotingComplete(voteStates, tie, _exiled);
        await this._votingComplete(tie, _exiled);

        this.emitSync(
            new MeetingHudVotingCompleteEvent(
                this.room,
                this,
                undefined,
                tie,
                new Map(voteStates.map(vote =>
                    [vote.playerId, vote])),
                _exiled
            )
        );
    }
}
