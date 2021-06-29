import { Hostable } from "../Hostable";

export enum VoteStateSpecialId {
    IsDead = 252,
    SkippedVote = 253,
    MissedVote = 254,
    NotVoted = 255
}

/**
 * Represents a player's voting state.
 */
export class PlayerVoteState<RoomType extends Hostable = Hostable> {
    constructor(
        public readonly room: RoomType,
        public playerId: number,
        public votedForId: number
    ) {}

    /**
     * The player that this vote state is for.
     */
    get player() {
        return this.room.getPlayerByPlayerId(this.playerId);
    }

    /**
     * Whether the player that this state represents is dead.
     */
    get isDead() {
        return this.votedForId === VoteStateSpecialId.IsDead;
    }

    /**
     * Whether this player didn't vote by the end of the meeting.
     */
    get didMissVote() {
        return this.votedForId === VoteStateSpecialId.MissedVote;
    }

    /**
     * Whether this player skipped voting.
     */
    get didSkip() {
        return this.votedForId === VoteStateSpecialId.SkippedVote;
    }

    /**
     * Whether this player has either voted for a player or voted to skip.
     */
    get hasVoted() {
        return this.votedForId < VoteStateSpecialId.IsDead ||
            this.votedForId === VoteStateSpecialId.SkippedVote;
    }

    /**
     * The player that this player voted for, if any.
     */
    get votedFor() {
        return this.room.getPlayerByPlayerId(this.votedForId);
    }
}
