export enum VoteState {
    VotedFor = 0xF,
    DidReport = 0x20,
    DidVote = 0x40,
    IsDead = 0x80
}

export interface PlayerVoteState {
    state: number;
    readonly voted: number;
}