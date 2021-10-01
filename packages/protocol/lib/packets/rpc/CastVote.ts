import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CastVoteMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CastVote as const;
    messageTag = RpcMessageTag.CastVote as const;

    votingid: number;
    suspectid: number;

    constructor(votingid: number, suspectid: number) {
        super();

        this.votingid = votingid;
        this.suspectid = suspectid;
    }

    static Deserialize(reader: HazelReader) {
        const votingid = reader.uint8();
        const suspectid = reader.uint8();

        return new CastVoteMessage(votingid, suspectid);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.votingid);
        writer.uint8(this.suspectid);
    }

    clone() {
        return new CastVoteMessage(this.votingid, this.suspectid);
    }
}
