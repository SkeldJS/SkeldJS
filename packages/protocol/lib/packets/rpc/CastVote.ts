import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CastVoteMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CastVote;

    constructor(public readonly votingId: number, public readonly suspectId: number) {
        super(CastVoteMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const votingId = reader.uint8();
        const suspectId = reader.uint8();
        return new CastVoteMessage(votingId, suspectId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.votingId);
        writer.uint8(this.suspectId);
    }

    clone() {
        return new CastVoteMessage(this.votingId, this.suspectId);
    }
}
