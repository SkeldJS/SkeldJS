import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class AppearMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.Appear;

    constructor(public readonly doAnimation: boolean) {
        super(AppearMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const doAnimation = reader.bool();
        return new AppearMessage(doAnimation);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.bool(this.doAnimation);
    }

    clone() {
        return new AppearMessage(this.doAnimation);
    }
}
