import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class VoteState {
    constructor(
        public readonly playerId: number,
        public readonly votedForId: number
    ) {}

    static deserializeFromReader(reader: HazelReader) {
        const [ playerId, mreader ] = reader.message();
        const votedForId = mreader.uint8();
        return new VoteState(playerId, votedForId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.begin(this.playerId);
        writer.uint8(this.votedForId);
        writer.end();
    }

    clone() {
        return new VoteState(this.playerId, this.votedForId);
    }
}

export class VotingCompleteMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.VotingComplete;

    constructor(public readonly states: VoteState[], public readonly exiledId: number, public readonly tie: boolean) {
        super(VotingCompleteMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const states = reader.lread(reader.packed(), VoteState);
        const exiledId = reader.uint8();
        const tie = reader.bool();

        return new VotingCompleteMessage(states, exiledId, tie);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.lwrite(true, this.states);
        writer.uint8(this.exiledId);
        writer.bool(this.tie);
    }

    clone() {
        return new VotingCompleteMessage(this.states.map(state => state.clone()), this.exiledId, this.tie);
    }
}
