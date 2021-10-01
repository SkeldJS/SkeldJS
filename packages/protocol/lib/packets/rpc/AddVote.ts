import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class AddVoteMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.AddVote as const;
    messageTag = RpcMessageTag.AddVote as const;

    votingid: number;
    targetid: number;

    constructor(votingid: number, targetid: number) {
        super();

        this.votingid = votingid;
        this.targetid = targetid;
    }

    static Deserialize(reader: HazelReader) {
        const votingid = reader.uint32();
        const targetid = reader.uint32();

        return new AddVoteMessage(votingid, targetid);
    }

    Serialize(writer: HazelWriter) {
        writer.uint32(this.votingid);
        writer.uint32(this.targetid);
    }

    clone() {
        return new AddVoteMessage(this.votingid, this.targetid);
    }
}
