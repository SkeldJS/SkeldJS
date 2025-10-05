import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SendChatMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SendChat as const;
    messageTag = RpcMessageTag.SendChat as const;

    message: string;

    constructor(message: string) {
        super();

        this.message = message;
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
