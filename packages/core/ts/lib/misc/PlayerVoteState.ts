import { VoteState } from "@skeldjs/constant";

import { Hostable } from "../Hostable";

export class PlayerVoteState {
    constructor(private room: Hostable, public playerId: number, public state: number) {}

    get votedFor() {
        return this.room.getPlayerByPlayerId((this.state & VoteState.VotedFor) - 1);
    }

    get reported() {
        return (this.state & VoteState.DidReport) > 0;
    }

    get voted() {
        return (this.state & VoteState.DidVote) > 0;
    }

    get dead() {
        return (this.state & VoteState.IsDead) > 0;
    }
}
