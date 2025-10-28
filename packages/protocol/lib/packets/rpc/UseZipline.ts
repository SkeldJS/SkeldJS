import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class UseZiplineMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.UseZipline;

    constructor(public readonly fromTop: boolean) {
        super(UseZiplineMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const doAnimation = reader.bool();

        return new UseZiplineMessage(doAnimation);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.bool(this.fromTop);
    }

    clone() {
        return new UseZiplineMessage(this.fromTop);
    }
}
