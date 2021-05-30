import { VoteState } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { Hostable } from "../Hostable";
import { PlayerData } from "../PlayerData";

/**
 * Represents a player's voting state.
 */
export class PlayerVoteState {
    static from(room: Hostable<any>, playerId: number, byte: number) {
        const state = new PlayerVoteState(
            room,
            playerId
        );
        state.patch(byte);
        return state;
    }

    constructor(
        private room: Hostable<any>,
        public playerId: number,
        public votedFor?: PlayerData,
        public reported: boolean = false,
        public voted: boolean = false,
        public dead: boolean = false
    ) {}

    get player() {
        return this.room.getPlayerByPlayerId(this.playerId);
    }

    get didSkip() {
        return this.voted && !this.votedFor;
    }

    get byte() {
        return (
            (this.votedFor? this.votedFor.playerId || 0 : 0) |
            (this.reported ? VoteState.DidReport : 0) |
            (this.voted ? VoteState.DidVote : 0) |
            (this.dead ? VoteState.IsDead : 0)
        );
    }

    patch(byte: number) {
        this.votedFor = this.room.getPlayerByPlayerId(
            (byte & VoteState.VotedFor) - 1
        );
        this.reported = (byte & VoteState.DidReport) > 0;
        this.voted = (byte & VoteState.DidVote) > 0;
        this.dead = (byte & VoteState.IsDead) > 0;
    }

    static Deserialize(
        reader: HazelReader,
        room: Hostable<any>,
        playerId: number
    ) {
        const byte = reader.uint8();

        return PlayerVoteState.from(room, playerId, byte);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.byte);
    }
}
