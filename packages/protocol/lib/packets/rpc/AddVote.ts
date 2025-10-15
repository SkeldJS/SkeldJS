import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class AddVoteMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.AddVote;

    constructor(public readonly votingId: number, public readonly targetId: number) {
        super(AddVoteMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const votingId = reader.uint32();
        const targetId = reader.uint32();
        return new AddVoteMessage(votingId, targetId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint32(this.votingId);
        writer.uint32(this.targetId);
    }

    clone() {
        return new AddVoteMessage(this.votingId, this.targetId);
    }
}
