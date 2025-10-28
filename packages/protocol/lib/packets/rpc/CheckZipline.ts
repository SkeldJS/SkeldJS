import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckZiplineMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckZipline;

    constructor(public readonly fromTop: boolean) {
        super(CheckZiplineMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const doAnimation = reader.bool();

        return new CheckZiplineMessage(doAnimation);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.bool(this.fromTop);
    }

    clone() {
        return new CheckZiplineMessage(this.fromTop);
    }
}
