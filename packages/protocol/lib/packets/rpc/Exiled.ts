import { RpcMessageTag } from "@skeldjs/au-constants";
import { BaseRpcMessage } from "./BaseRpcMessage";
import { HazelWriter } from "@skeldjs/hazel";

export class ExiledMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.Exiled;

    constructor() { super(ExiledMessage.messageTag) }

    static deserializeFromReader() {
        return new ExiledMessage;
    }

    serializeToWriter(writer: HazelWriter): void {
        void writer;
    }

    clone() {
        return new ExiledMessage;
    }
}
