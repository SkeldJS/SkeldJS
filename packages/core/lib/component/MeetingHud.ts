import { HazelReader, HazelWriter } from "@skeldjs/util";

import {
    ChatNoteType,
    RpcMessageTag,
    SpawnType
} from "@skeldjs/constant";

import { RpcMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerDataResolvable, Hostable } from "../Hostable";
import { PlayerVoteState } from "../misc/PlayerVoteState";
import { Heritable } from "../Heritable";

import {
    MeetingHudMeetingCloseEvent,
    MeetingHudVoteCastEvent,
    MeetingHudVoteClearEvent,
    MeetingHudVotingCompleteEvent,
} from "../events";
import { PlayerData } from "../PlayerData";

export interface MeetingHudData {
    states: Map<number, PlayerVoteState>;
    tie?: boolean;
    exilied?: PlayerData;
}

export type MeetingHudEvents =
    NetworkableEvents &
ExtractEventTypes<[
    MeetingHudVoteCastEvent,
    MeetingHudVoteClearEvent,
    MeetingHudVotingCompleteEvent,
    MeetingHudMeetingCloseEvent
]>;

export class MeetingHud extends Networkable<MeetingHudData, MeetingHudEvents> {
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
    }

    get owner() {
        return super.owner as Heritable;
    }

    Deserialize(reader: HazelReader, spawn: boolean = false) {
        if (spawn) {
            this.dirtyBit = 0;
            this.states = new Map();

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

    async HandleRpc(callid: RpcMessageTag, reader: HazelReader) {
        switch (callid) {
            case RpcMessageTag.Close:
                await this._handleClose(reader);
                break;
            case RpcMessageTag.VotingComplete:
                await this._handleVotingComplete(reader);
                break;
            case RpcMessageTag.CastVote:
                await this._handleCastVote(reader);
                break;
            case RpcMessageTag.ClearVote:
                await this._handleClearVote(reader);
                break;
        }
    }

    private _handleClose(reader: HazelReader) {
        void reader;

        this.emit(new MeetingHudMeetingCloseEvent(this.room, this));
    }

    private _close() {
        // todo: meeting close routine
        void 0;
    }

    private _rpcClose() {
        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.Close, Buffer.alloc(0))
        );
    }

    /**
     * Close the meeting hud for all clients.
     */
    close() {
        this._close();
        this._rpcClose();
    }

    private async _handleCastVote(reader: HazelReader) {
        const votingid = reader.uint8();
        const suspectid = reader.uint8();

        const voting = this.states.get(votingid);
        const suspect = suspectid === 0xff
            ? undefined
            : this.room.getPlayerByPlayerId(suspectid);

        if (voting && (suspect || suspectid === 0xff)) {
            this._castVote(voting, suspect);

            await this.emit(
                new MeetingHudVoteCastEvent(
                    this.room,
                    this,
                    this.room.getPlayerByPlayerId(votingid),
                    this.room.getPlayerByPlayerId(suspectid)
                )
            );
        }
    }

    private _castVote(voting: PlayerVoteState, suspect?: PlayerData) {
        if (suspect)
            voting.votedFor = suspect;

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
            suspect === "skip"
                ? undefined
                : this.room.resolvePlayer(suspect);

        if (player) {
            const _voting = this.states.get(player.playerId);

            if (_voting && _suspect) {
                this._castVote(_voting, _suspect);
                player.control.sendChatNote(ChatNoteType.DidVote);
            }
        }
    }

    private async _handleClearVote(reader: HazelReader) {
        void reader;

        const player = this.room.me;

        if (player) {
            const voter = this.states.get(player.playerId);

            if (voter?.voted) {
                this._clearVote(voter);

                await this.emit(
                    new MeetingHudVoteClearEvent(
                        this.room,
                        this,
                        player
                    )
                );
            }
        }
    }

    private _clearVote(voter: PlayerVoteState) {
        if (voter.voted) {
            voter.votedFor = null;
            voter.voted = false;
            this.dirtyBit |= 1 << voter.playerId;
        }
    }

    private async _rpcClearVote(voter: PlayerVoteState) {
        await this.room.broadcast(
            [
                new RpcMessage(
                    this.netid,
                    RpcMessageTag.ClearVote,
                    Buffer.alloc(0)
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

        if (player) {
            const _voter = this.states.get(player.playerId);

            if (_voter) {
                this._clearVote(_voter);
                await this._rpcClearVote(_voter);
            }
        }
    }

    private async _handleVotingComplete(reader: HazelReader) {
        const states = reader.list(reader => reader.uint8());
        const exiledid = reader.uint8();
        const tie = reader.bool();

        const exiled = exiledid === 0xff
            ? undefined
            : this.room.getPlayerByPlayerId(exiledid);

        this._votingComplete(states, tie, exiled);

        await this.emit(
            new MeetingHudVotingCompleteEvent(
                this.room,
                this,
                tie,
                new Map(
                    states.map((state, i) => [
                        i,
                        PlayerVoteState.from(this.room, i, state),
                    ])
                ),
                exiled
            )
        );
    }

    private _votingComplete(states: number[], tie: boolean, exiled?: PlayerData) {
        for (let i = 0; i < states.length; i++) {
            const state = this.states.get(i);
            if (state) {
                state.patch(states[i]);
            }
        }
        this.tie = tie;
        this.exiled = exiled;
    }

    private _rpcVotingComplete(states: number[], tie: boolean, exiled: PlayerData) {
        const writer = HazelWriter.alloc(4);
        writer.list(true, states, state => writer.uint8(state));
        writer.uint8(exiled ? exiled.playerId : 0xff);
        writer.bool(tie);

        this.room.stream.push(
            new RpcMessage(
                this.netid,
                RpcMessageTag.VotingComplete,
                writer.buffer
            )
        );
    }

    votingComplete(tie: boolean, exiled?: PlayerDataResolvable) {
        const _exiled = this.room.resolvePlayer(exiled);

        const states = new Array(this.room.players.size);
        for (const [ playerid, state ] of this.states) {
            states[playerid] = state.byte;
        }

        this._votingComplete(states, tie, _exiled);
        this._rpcVotingComplete(states, tie, _exiled);
    }
}
