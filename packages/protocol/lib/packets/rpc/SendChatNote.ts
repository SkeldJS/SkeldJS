import { ChatNoteType, RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SendChatNoteMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SendChatNote as const;
    messageTag = RpcMessageTag.SendChatNote as const;

    constructor(public readonly playerId: number, public readonly notetype: ChatNoteType) {
        super(SendChatNoteMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const playerId = reader.uint8();
        const notetype = reader.uint8();
        return new SendChatNoteMessage(playerId, notetype);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.playerId);
        writer.uint8(this.notetype);
    }

    clone() {
        return new SendChatNoteMessage(this.playerId, this.notetype);
    }
}
