import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetLevelMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetLevel;

    constructor(public readonly level: number) {
        super(SetLevelMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const level = reader.packed();

        return new SetLevelMessage(level);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.packed(this.level);
    }

    clone() {
        return new SetLevelMessage(this.level);
    }
}
