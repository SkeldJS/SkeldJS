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

import { Networkable, NetworkableEvents, NetworkableConstructor } from "../Networkable";
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
import { AmongUsEndGames, EndGameIntent, PlayersVoteOutEndgameMetadata } from "../endgame";

export interface MeetingHudData {
    voteStates: Map<number, PlayerVoteArea>;
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
    /**
     * The dirty vote states to be updated on the next fixed update.
     */
    dirtyBit: number;

    /**
     * The vote states in the meeting hud.
     */
    voteStates: Map<number, PlayerVoteArea<RoomType>>;

    /**
     * Whether the vote resulted in a tie.
     */
    tie?: boolean;

    /**
     * The player that was exiled, if any.
     */
    exiled?: PlayerData<RoomType>;

    ranOutOfTimeTimeout?: NodeJS.Timeout;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | MeetingHudData
    ) {
        super(room, spawnType, netId, ownerid, flags, data);

        this.dirtyBit ||= 0;
        this.voteStates ||= new Map;
    }

    Awake() {
        if (this.room.gameData) {
            this.voteStates = new Map(
                [...this.room.gameData.players]
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
        }

        if (this.room.settings.votingTime > 0) {
            this.ranOutOfTimeTimeout = setTimeout(() => {
                for (const [ , voteState ] of this.voteStates) {
                    if (voteState.votedForId === 255) {
                        voteState.setMissed();
                    }
                }

                this.checkForVoteComplete(true);
            }, 8000 + this.room.settings.discussionTime * 1000 + this.room.settings.votingTime * 1000);
        }
    }

    getComponent<T extends Networkable>(
        component: NetworkableConstructor<T>
    ): T|undefined {
        if (this.spawnType === SpawnType.MeetingHud && component === MeetingHud as NetworkableConstructor<any>) {
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
            this.voteStates = new Map;
        }

        const numVotes = reader.packed();
        for (let i = 0; i < numVotes; i++) {
            const [ playerId, mreader ] = reader.message();
            const player = this.room.getPlayerByPlayerId(playerId);

            if (!player)
                continue;

            const oldState = this.voteStates.get(playerId);
            const newState = PlayerVoteArea.Deserialize(mreader, this, playerId);

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

    Serialize(writer: HazelWriter, spawn: boolean = false) {
        writer.upacked(this.voteStates.size);
        for (const [, state] of this.voteStates) {
            writer.begin(state.playerId);
            state.Serialize(writer);
            writer.end();
        }
        this.dirtyBit = 0;
        return true;
    }

    async HandleRpc(rpc: BaseRpcMessage) {
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

    private _close() {
        this.room["_despawnComponent"](this);
        if (this.room.shipStatus) {
            for (const [ , player ] of this.room.players) {
                this.room.shipStatus.spawnPlayer(player, true, true);
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
    close() {
        this._close();
        this._rpcClose();
    }

    checkForVoteComplete(isTimeout: boolean) {
        const states = [...this.voteStates];

        if (states.every(([, state]) => state.hasVoted || !state.canVote) || isTimeout) {
            let tie = false;
            let exiled: PlayerData|undefined;
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

        if (this.canBeManaged() && player && voter && (suspect || rpc.suspectid === VoteStateSpecialId.SkippedVote)) {
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
                this.room.host?.control?.sendChatNote(
                    player,
                    ChatNoteType.DidVote
                );

                this.checkForVoteComplete(false);
            }
        }
    }

    private _castVote(voterState: PlayerVoteArea<RoomType>, suspect?: PlayerData<RoomType>) {
        if (voterState) {
            if (suspect) {
                voterState.setSuspect(suspect.playerId!);
            } else {
                voterState.setSkipped();
            }
        }
    }

    private async _rpcCastVote(voter: PlayerData, suspect: PlayerData|undefined) {
        await this.room.broadcast([
            new RpcMessage(
                this.netId,
                new CastVoteMessage(
                    voter.playerId!,
                    suspect
                        ? suspect.playerId!
                        : 255
                )
            )
        ], undefined, [ this.room.hostId ]);
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
        voter: PlayerDataResolvable,
        suspect: PlayerDataResolvable | "skip"
    ) {
        const player = this.room.resolvePlayer(voter);

        const _suspect =
            suspect === "skip" ? undefined : this.room.resolvePlayer(suspect);

        if (player && player.playerId !== undefined) {
            const votingState = this.voteStates.get(player.playerId);

            if (votingState) {
                if (this.canBeManaged()) {
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
                        this.room.host?.control?.sendChatNote(
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

        const player = this.room.myPlayer;

        if (player && player.playerId !== undefined) {
            const voter = this.voteStates.get(player.playerId);

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
            voter.clearVote();
            voter.dirty = true;
        }
    }

    private async _rpcClearVote(voter: PlayerData) {
        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netId,
                    new ClearVoteMessage
                ),
            ],
            undefined,
            [ voter ]
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
            const _voter = this.voteStates.get(player.playerId);

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
                await this._rpcClearVote(player);
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

        this._populateStates(playerStates);
        await this._votingComplete(rpc.tie, exiled);

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
        exiled?: PlayerData<RoomType>
    ) {
        this.tie = tie;
        this.exiled = exiled;

        if (this.canBeManaged()) {
            await sleep(5000);
            await exiled?.control?.kill("exiled");
            this.close();
            await sleep(5000);

            if (exiled && this.room.gameData) {
                let aliveCrewmates = 0;
                let aliveImpostors = 0;
                for (const [ , playerInfo ] of this.room.gameData.players) {
                    if (!playerInfo.isDisconnected && !playerInfo.isDead)
                    {
                        if (playerInfo.isImpostor)
                        {
                            aliveImpostors++;
                        } else {
                            aliveCrewmates++;
                        }
                    }
                }

                if (exiled.playerInfo?.isImpostor) {
                    if (aliveImpostors <= 0) {
                        this.room.registerEndGameIntent(
                            new EndGameIntent<PlayersVoteOutEndgameMetadata>(
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
                            new EndGameIntent<PlayersVoteOutEndgameMetadata>(
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
        exiled?: PlayerData<RoomType>
    ) {
        this.room.messageStream.push(
            new RpcMessage(
                this.netId,
                new VotingCompleteMessage(
                    states.map(state => new VoteState(state.playerId, state.votedForId)), exiled ? exiled.playerId ?? 0xff : 0xff, tie)
            )
        );
    }

    /**
     * End the meeting with specified results. This is a host-only operation
     * on official servers.
     * @param tie Whether this meeting resulted in a tie of votes.
     * @param exiled The player that was ejected, if any.
     */
    async votingComplete(tie: boolean = false, exiled?: PlayerDataResolvable) {
        const _exiled = exiled ? this.room.resolvePlayer(exiled) : undefined;

        if (!this.room.gameData)
            return;

        const voteStates: PlayerVoteState<RoomType>[] = new Array(this.room.gameData.players.size);
        let i = 0;
        for (const [ playerId, state ] of this.voteStates) {
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
                    [ vote.playerId, vote ])),
                _exiled
            )
        );
    }
}
