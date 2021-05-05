import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SendChatMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.SendChat as const;
    tag = RpcMessageTag.SendChat as const;

    message: string;

    constructor(message: string) {
        super();

        this.message = message;
    }

    static Deserialize(reader: HazelReader) {
        const message = reader.string();

        return new SendChatMessage(message);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.message);
    }
}
