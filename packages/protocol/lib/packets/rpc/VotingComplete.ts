import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class VotingCompleteMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.VotingComplete as const;
    tag = RpcMessageTag.VotingComplete as const;

    states: number[];
    exiledid: number;
    tie: boolean;

    constructor(states: number[], exiledid: number, tie: boolean) {
        super();

        this.states = states;
        this.exiledid = exiledid;
        this.tie = tie;
    }

    static Deserialize(reader: HazelReader) {
        const states = reader.list((r) => r.uint8());
        const exiled = reader.uint8();
        const tie = reader.bool();

        return new VotingCompleteMessage(states, exiled, tie);
    }

    Serialize(writer: HazelWriter) {
        writer.list(true, this.states, (s) => writer.uint8(s));
        writer.uint8(this.exiledid);
        writer.bool(this.tie);
    }
}
