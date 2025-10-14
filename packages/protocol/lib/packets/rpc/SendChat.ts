import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
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
