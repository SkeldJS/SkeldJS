import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";
import { HazelWriter } from "@skeldjs/util";

export class CloseMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.Close;

    constructor() { super(CloseMessage.messageTag) }

    static deserializeFromReader() {
        return new CloseMessage;
    }

    serializeToWriter(writer: HazelWriter): void {
        void writer;
    }

    clone() {
        return new CloseMessage;
    }
}
