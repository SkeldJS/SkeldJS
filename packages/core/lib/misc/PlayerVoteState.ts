import { VoteState } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { Hostable } from "../Hostable";

/**
 * Represents a player's voting state.
 */
export class PlayerVoteState {
    constructor(
        private room: Hostable<any>,
        public playerId: number,
        public state: number
    ) {}

    static Deserialize(reader: HazelReader, room: Hostable<any>, playerId: number) {
        const state = reader.uint8();

        return new PlayerVoteState(room, playerId, state);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.state);
    }

    /**
     * The player that the voter voted for.
     */
    get votedFor() {
        return this.room.getPlayerByPlayerId(
            (this.state & VoteState.VotedFor) - 1
        );
    }

    /**
     * Whether or not the player started the meeting.
     */
    get reported() {
        return (this.state & VoteState.DidReport) > 0;
    }

    /**
     * Whether or not the player has voted.
     */
    get voted() {
        return (this.state & VoteState.DidVote) > 0;
    }

    /**
     * Whether or not the player is dead.
     */
    get dead() {
        return (this.state & VoteState.IsDead) > 0;
    }
}
