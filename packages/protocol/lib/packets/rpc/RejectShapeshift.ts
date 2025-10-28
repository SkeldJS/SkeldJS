import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";
import { HazelWriter } from "@skeldjs/hazel";

export class RejectShapeshiftMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.RejectShapeshift;

    constructor() { super(RejectShapeshiftMessage.messageTag) }

    static deserializeFromReader() {
        return new RejectShapeshiftMessage;
    }

    serializeToWriter(writer: HazelWriter): void {
        void writer;
    }

    clone() {
        return new RejectShapeshiftMessage;
    }
}
