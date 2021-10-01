import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class VoteState {
    constructor(
        public readonly playerId: number,
        public readonly votedForId: number
    ) {}

    static Deserialize(reader: HazelReader) {
        const [ playerId, mreader ] = reader.message();
        const votedForId = mreader.uint8();
        return new VoteState(playerId, votedForId);
    }

    Serialize(writer: HazelWriter) {
        writer.begin(this.playerId);
        writer.uint8(this.votedForId);
        writer.end();
    }

    clone() {
        return new VoteState(this.playerId, this.votedForId);
    }
}

export class VotingCompleteMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.VotingComplete as const;
    messageTag = RpcMessageTag.VotingComplete as const;

    states: VoteState[];
    exiledid: number;
    tie: boolean;

    constructor(states: VoteState[], exiledid: number, tie: boolean) {
        super();

        this.states = states;
        this.exiledid = exiledid;
        this.tie = tie;
    }

    static Deserialize(reader: HazelReader) {
        const states = reader.lread(reader.packed(), VoteState);
        const exiled = reader.uint8();
        const tie = reader.bool();

        return new VotingCompleteMessage(states, exiled, tie);
    }

    Serialize(writer: HazelWriter) {
        writer.lwrite(true, this.states);
        writer.uint8(this.exiledid);
        writer.bool(this.tie);
    }

    clone() {
        return new VotingCompleteMessage(this.states.map(state => state.clone()), this.exiledid, this.tie);
    }
}
