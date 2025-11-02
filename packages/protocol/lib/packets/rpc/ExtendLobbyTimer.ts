import { RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ExtendLobbyTimerMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ExtendLobbyTimer;

    constructor(public readonly extensionId: number) {
        super(ExtendLobbyTimerMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const extensionId = reader.packed();
        return new ExtendLobbyTimerMessage(extensionId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.packed(this.extensionId);
    }

    clone() {
        return new ExtendLobbyTimerMessage(this.extensionId);
    }
}
