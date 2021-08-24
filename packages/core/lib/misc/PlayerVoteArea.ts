import { HazelReader, HazelWriter } from "@skeldjs/util";
import { Hostable } from "../Hostable";
import { VoteStateSpecialId } from "./PlayerVoteState";

export class PlayerVoteArea<RoomType extends Hostable = Hostable> {
    dirty: boolean;

    constructor(
        public readonly room: RoomType,
        public playerId: number,
        public votedForId: number,
        public didReport: boolean
    ) {
        this.dirty = false;
    }

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
        if (this.votedForId >= VoteStateSpecialId.IsDead)
            return undefined;

        return this.room.getPlayerByPlayerId(this.votedForId);
    }

    static Deserialize<RoomType extends Hostable = Hostable>(reader: HazelReader, room: RoomType, playerId: number) {
        const votedForId = reader.uint8();
        const didReport = reader.bool();
        return new PlayerVoteArea(room ,playerId, votedForId, didReport);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.votedForId);
        writer.bool(this.didReport);
    }

    clearVote() {
        this.votedForId = VoteStateSpecialId.NotVoted;
    }

    setSkipped() {
        this.votedForId = VoteStateSpecialId.SkippedVote;
    }

    setDead() {
        return this.votedForId = VoteStateSpecialId.IsDead;
    }

    setSuspect(playerId: number) {
        if (playerId >= 252) {
            throw new RangeError("Suspect player ID cannot be greater than 252.");
        }

        this.votedForId = playerId;
    }
}
