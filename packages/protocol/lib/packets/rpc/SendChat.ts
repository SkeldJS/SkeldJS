import { RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SendChatMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SendChat;

    constructor(public readonly message: string) {
        super(SendChatMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const message = reader.string();
        return new SendChatMessage(message);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.string(this.message);
    }

    clone() {
        return new SendChatMessage(this.message);
    }
}
