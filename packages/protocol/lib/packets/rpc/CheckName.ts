import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckNameMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckName;

    constructor(public readonly name: string) {
        super(CheckNameMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const name = reader.string();
        return new CheckNameMessage(name);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.string(this.name);
    }

    clone() {
        return new CheckNameMessage(this.name);
    }
}
