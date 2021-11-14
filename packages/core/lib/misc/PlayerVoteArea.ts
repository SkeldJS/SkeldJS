import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MeetingHud } from "..";
import { Hostable } from "../Hostable";
import { VoteStateSpecialId } from "./PlayerVoteState";

export class PlayerVoteArea<RoomType extends Hostable = Hostable> {
    constructor(
        public readonly meetinghud: MeetingHud<RoomType>,
        public playerId: number,
        public votedForId: number,
        public didReport: boolean
    ) {}

    get dirty() {
        return this.meetinghud.dirtyBit > 0;
    }

    set dirty(value: boolean) {
        if (value) {
            this.meetinghud.dirtyBit = 1;
        }
    }

    /**
     * The player that this vote state is for.
     */
    get player() {
        return this.meetinghud.room.getPlayerByPlayerId(this.playerId);
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

        return this.meetinghud.room.getPlayerByPlayerId(this.votedForId);
    }

    get canVote() {
        const playerInfo = this.player?.playerInfo;
        return !playerInfo?.isDead && !playerInfo?.isDisconnected;
    }

    static Deserialize<RoomType extends Hostable = Hostable>(reader: HazelReader, meetinghud: MeetingHud<RoomType>, playerId: number) {
        const votedForId = reader.uint8();
        const didReport = reader.bool();
        return new PlayerVoteArea(meetinghud, playerId, votedForId, didReport);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.votedForId);
        writer.bool(this.didReport);
    }

    clearVote() {
        this.votedForId = VoteStateSpecialId.NotVoted;
        this.dirty = true;
    }

    setSkipped() {
        this.votedForId = VoteStateSpecialId.SkippedVote;
        this.dirty = true;
    }

    setSuspect(playerId: number) {
        if (playerId >= 252) {
            throw new RangeError("Suspect player ID cannot be greater than 252.");
        }

        this.votedForId = playerId;
        this.dirty = true;
    }

    setMissed() {
        this.votedForId = VoteStateSpecialId.MissedVote;
        this.dirty = true;
    }
}
