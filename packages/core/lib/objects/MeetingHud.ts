import { HazelReader } from "@skeldjs/hazel";

import { ChatNoteType, RpcMessageTag } from "@skeldjs/au-constants";

import {
    BaseSystemMessage,
    BaseRpcMessage,
    CastVoteMessage,
    ClearVoteMessage,
    CloseMessage,
    MeetingHudDataMessage,
    RpcMessage,
    VoteAreaDataMessage,
    VoteState,
    VotingCompleteMessage,
} from "@skeldjs/au-protocol";
import { EventMapFromList } from "@skeldjs/events";

import { DataState, NetworkedObject } from "../NetworkedObject";
import { PlayerResolvable, StatefulRoom } from "../StatefulRoom";

import {
    MeetingHudCloseEvent,
    MeetingHudVoteCastEvent,
    MeetingHudClearVoteEvent,
    MeetingHudVotingCompleteEvent,
} from "../events";

import { Player } from "../Player";

import { setTimeoutPromise } from "../utils/setTimeoutPromise";
import { CrewmatesByVoteEndGameIntent, ImpostorByVoteEndGameIntent } from "../EndGameIntent";

export class PlayerVoteArea<RoomType extends StatefulRoom> {
    isDirty: boolean = false;

    constructor(
        public readonly meetinghud: MeetingHud<RoomType>,
        public playerId: number,
        public votedForId: number,
        public didReport: boolean
    ) { }

    pushDataUpdate() {
        this.isDirty = true;
        this.meetinghud.pushDataState(DataState.Update);
    }

    /**
     * The player that this vote state is for.
     */
    getPlayer() {
        return this.meetinghud.room.getPlayerByPlayerId(this.playerId);
    }

    /**
     * Whether this player skipped voting.
     */
    didSkip() {
        return this.votedForId === VoteStateSpecialId.SkippedVote;
    }

    /**
     * Whether this player has either voted for a player or voted to skip.
     */
    hasVoted() {
        return this.votedForId < VoteStateSpecialId.IsDead ||
            this.votedForId === VoteStateSpecialId.SkippedVote;
    }

    /**
     * The player that this player voted for, if any.
     */
    getSuspect() {
        if (this.votedForId >= VoteStateSpecialId.IsDead)
            return undefined;

        return this.meetinghud.room.getPlayerByPlayerId(this.votedForId);
    }

    canVote() {
        const player = this.getPlayer();
        if (!player) return false;
        const playerInfo = player.getPlayerInfo();
        if (!playerInfo) return false;
        return !playerInfo.isDead && !playerInfo.isDisconnected;
    }

    clearVoteWithAuth() {
        this.votedForId = VoteStateSpecialId.NotVoted;
        this.pushDataUpdate();
    }

    setSkippedWithAuth() {
        this.votedForId = VoteStateSpecialId.SkippedVote;
        this.pushDataUpdate();
    }

    setSuspectWithAuth(playerId: number) {
        if (playerId >= 252) {
            throw new RangeError("Suspect player ID cannot be greater than 252.");
        }

        this.votedForId = playerId;
        this.pushDataUpdate();
    }

    setMissedWithAuth() {
        this.votedForId = VoteStateSpecialId.MissedVote;
        this.pushDataUpdate();
    }
}

export enum VoteStateSpecialId {
    IsDead = 252,
    SkippedVote = 253,
    MissedVote = 254,
    NotVoted = 255
}

/**
 * Represents a player's voting state.
 */
export class PlayerVoteState<RoomType extends StatefulRoom> {
    constructor(
        public readonly room: RoomType,
        public playerId: number,
        public votedForId: number
    ) { }

    /**
     * The player that this vote state is for.
     */
    getPlayer() {
        return this.room.getPlayerByPlayerId(this.playerId);
    }

    /**
     * Whether the player that this state represents is dead.
     */
    isDead() {
        return this.votedForId === VoteStateSpecialId.IsDead;
    }

    /**
     * Whether this player didn't vote by the end of the meeting.
     */
    didMissVote() {
        return this.votedForId === VoteStateSpecialId.MissedVote;
    }

    /**
     * Whether this player skipped voting.
     */
    didSkip() {
        return this.votedForId === VoteStateSpecialId.SkippedVote;
    }

    /**
     * Whether this player has either voted for a player or voted to skip.
     */
    hasVoted() {
        return this.votedForId < VoteStateSpecialId.IsDead ||
            this.votedForId === VoteStateSpecialId.SkippedVote;
    }

    /**
     * The player that this player voted for, if any.
     */
    getPlayerVotedFor() {
        return this.room.getPlayerByPlayerId(this.votedForId);
    }
}

export type MeetingHudEvents<RoomType extends StatefulRoom> = EventMapFromList<
    [
        MeetingHudVoteCastEvent<RoomType>,
        MeetingHudClearVoteEvent<RoomType>,
        MeetingHudVotingCompleteEvent<RoomType>,
        MeetingHudCloseEvent<RoomType>
    ]
>;

export class MeetingHud<RoomType extends StatefulRoom> extends NetworkedObject<RoomType, MeetingHudEvents<RoomType>> {
    static animationDuration = 8;

    /**
     * The dirty vote states to be updated on the next fixed update.
     */
    dirtyBit: number = 0;

    /**
     * The vote states in the meeting hud.
     */
    voteStates: Map<number, PlayerVoteArea<RoomType>> = new Map;

    closeTimer: number = 0;

    async processAwake() {
        if (this.room.canManageObject(this)) {
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
                this.closeTimer = MeetingHud.animationDuration + this.room.settings.discussionTime + this.room.settings.votingTime;
            }
        }
    }

    get owner() {
        return super.owner as RoomType;
    }

    parseData(state: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (state) {
            case DataState.Spawn:
            case DataState.Update: return MeetingHudDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof MeetingHudDataMessage) {
            for (const voteArea of data.voteStates) {
                const player = this.room.getPlayerByPlayerId(voteArea.playerId);

                if (!player)
                    continue;

                const oldState = this.voteStates.get(voteArea.playerId);
                const newState = new PlayerVoteArea(this, voteArea.playerId, voteArea.votedForId, voteArea.didReport);

                this.voteStates.set(voteArea.playerId, newState);

                if (!oldState?.hasVoted() && newState.hasVoted()) {
                    await this.emit(
                        new MeetingHudVoteCastEvent(
                            this.room,
                            this,
                            undefined,
                            player,
                            newState.getSuspect()
                        )
                    );
                } else if (oldState?.getSuspect() && !newState.hasVoted()) {
                    await this.emit(
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
    }

    createData(state: DataState): BaseSystemMessage | undefined {
        switch (state) {
        case DataState.Spawn:
        case DataState.Update: return new MeetingHudDataMessage(
                [...this.voteStates.values()] 
                    .filter(voteState => state === DataState.Spawn || voteState.isDirty)
                    .map(voteState => new VoteAreaDataMessage(voteState.playerId, voteState.votedForId, voteState.didReport))
            );
        }
        return undefined;
    }

    parseRemoteCall(rpcTag: RpcMessageTag, reader: HazelReader): BaseRpcMessage | undefined {
        switch (rpcTag) {
            case RpcMessageTag.Close: return CloseMessage.deserializeFromReader();
            case RpcMessageTag.VotingComplete: return VotingCompleteMessage.deserializeFromReader(reader);
            case RpcMessageTag.CastVote: return CastVoteMessage.deserializeFromReader(reader);
            case RpcMessageTag.ClearVote: return ClearVoteMessage.deserializeFromReader();
        }
        return undefined;
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {
        if (rpc instanceof CloseMessage) return await this._handleClose(rpc);
        if (rpc instanceof VotingCompleteMessage) return await this._handleVotingComplete(rpc);
        if (rpc instanceof CastVoteMessage) return await this._handleCastVote(rpc);
        if (rpc instanceof ClearVoteMessage) return await this._handleClearVote(rpc);
    }
    
    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        if (this.closeTimer > 0) {
            this.closeTimer -= deltaSeconds;
            if (this.closeTimer <= 0 && this.room.canManageObject(this)) {
                await this.checkForVoteComplete(true);
            }
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
                await this.room.shipStatus.positionPlayerAtSpawn(player, true, true);
            }
        }
    }

    private _rpcClose() {
        this.room.broadcastLazy(
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

    async checkForVoteComplete(isTimeout: boolean) {
        const states = [...this.voteStates];

        if (states.every(([, state]) => state.hasVoted() || !state.canVote()) || isTimeout) {
            let tie = false;
            let exiled: Player<RoomType> | undefined;
            let exiledVotes = 0;
            let numSkips = 0;
            for (const [, state2] of states) {
                if (state2.didSkip()) {
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
                        exiled = state.getPlayer();
                        exiledVotes = num;
                    } else if (num === exiledVotes) {
                        tie = true;
                        exiled = undefined;
                    }
                }
            }

            if (numSkips >= exiledVotes)
                exiled = undefined;

            this.votingComplete(tie, exiled); // don't `await` this, as it waits 10 seconds for the meeting hud to close
        }
    }

    private async _handleCastVote(rpc: CastVoteMessage) {
        const voter = this.voteStates.get(rpc.votingId);
        const player = this.room.getPlayerByPlayerId(rpc.votingId);
        const suspect =
            rpc.suspectId === VoteStateSpecialId.SkippedVote
                ? undefined
                : this.room.getPlayerByPlayerId(rpc.suspectId);

        if (this.room.canManageObject(this) && player && voter && (suspect || rpc.suspectId === VoteStateSpecialId.SkippedVote)) {
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

            if (ev.pendingRevert) {
                if (player) {
                    await this.clearVoteWithAuth(player);
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
                voterState.setSuspectWithAuth(suspect.getPlayerId()!);
            } else {
                voterState.setSkippedWithAuth();
            }
        }
    }

    private async _rpcCastVote(voter: Player<RoomType>, suspect: Player<RoomType> | undefined) {
        await this.room.broadcastImmediate([
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

                    if (ev.pendingRevert) {
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

        await this.room.clearMyVoteImpl(this);


    }

    private _clearVote(voter: PlayerVoteArea<RoomType>) {
        if (voter.hasVoted()) {
            voter.clearVoteWithAuth();
        }
    }

    private async _rpcClearVote(voter: Player<RoomType>) {
        await this.room.broadcastImmediate(
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
                    player,
                )
            );
        }
    }

    /**
     * Remove someone's vote (usually due to the player they voted for getting disconnected).
     * This is a host-only operation on official servers.
     * @param resolvable The player to remove the vote of.
     */
    async clearVoteWithAuth(voter: PlayerResolvable) {
        const player = this.room.resolvePlayer(voter);

        if (player && player.getPlayerId() !== undefined) {
            const clearedVote = await this.setVoteCleared(player);
            await this._rpcClearVote(player);
        }
    }

    private async _handleVotingComplete(rpc: VotingCompleteMessage) {
        const exiled =
            rpc.exiledId === 0xff
                ? undefined
                : this.room.getPlayerByPlayerId(rpc.exiledId);

        const playerStates = rpc.states.map((state, i) => {
            return new PlayerVoteState(this.room, state.playerId, state.votedForId);
        });

        this._populateStates(playerStates);
        await this._votingComplete(exiled);

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

    protected async _votingComplete(exiled: Player<RoomType>|undefined) {
        this.closeTimer = -1;

        if (this.room.canManageObject(this)) {
            await setTimeoutPromise(5000);
            await this.close();
            await setTimeoutPromise(5000);
            await exiled?.characterControl?.causeToDie("exiled");

            if (exiled) {
                const counts = this.room.countPlayersRemaining();
                
                if (counts) {
                    const { aliveCrewmates, aliveImpostors } = counts;

                    if (exiled.getPlayerInfo()?.isImpostor) {
                        if (aliveImpostors <= 0) {
                            this.room.registerEndGameIntent(new CrewmatesByVoteEndGameIntent(exiled));
                        }
                    } else {
                        if (aliveCrewmates <= aliveImpostors) {
                            this.room.registerEndGameIntent(new ImpostorByVoteEndGameIntent(exiled));
                        }
                    }
                }
            }
        }
    }

    protected _rpcVotingComplete(
        states: PlayerVoteState<RoomType>[],
        tie: boolean,
        exiled?: Player<RoomType>
    ) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new VotingCompleteMessage(
                    states.map(state => new VoteState(state.playerId, state.votedForId)),
                    exiled ? exiled.getPlayerId() ?? 0xff : 0xff,
                    tie
                )
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

        this._rpcVotingComplete(voteStates, tie, _exiled);
        await this._votingComplete(_exiled);

        await this.emit(
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
