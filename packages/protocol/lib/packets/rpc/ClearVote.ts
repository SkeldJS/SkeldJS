import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";
import { HazelWriter } from "@skeldjs/util";

export class ClearVoteMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ClearVote;

    constructor() { super(ClearVoteMessage.messageTag) }

    static deserializeFromReader() {
        return new ClearVoteMessage;
    }

    serializeToWriter(writer: HazelWriter): void {
        void writer;
    }

    clone() {
        return new ClearVoteMessage;
    }
}
