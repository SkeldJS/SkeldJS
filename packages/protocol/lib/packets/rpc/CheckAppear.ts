import { RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckAppearMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckAppear;

    constructor(public readonly doAnimation: boolean) {
        super(CheckAppearMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const doAnimation = reader.bool();
        return new CheckAppearMessage(doAnimation);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.bool(this.doAnimation);
    }

    clone() {
        return new CheckAppearMessage(this.doAnimation);
    }
}
